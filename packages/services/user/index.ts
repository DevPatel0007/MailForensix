import { randomBytes , createHmac} from 'node:crypto'
import { and, db, eq } from '@repo/database'
import { accountsTable } from '@repo/database/models/account'
import {usersTable} from '@repo/database/models/user' 
import {type CreateUserWithEmailAndPasswordInputType, createUserWithEmailAndPasswordInput} from './model'
import {
  decryptGmailToken,
  encryptGmailToken,
  revokeGmailGrant,
} from "../gmail/tokens";

class UserService {

  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()))
    if (!result || result.length === 0) return null
    return result[0]
  }
  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const {fullName,email,password} = await createUserWithEmailAndPasswordInput.parseAsync(payload)

    // Check if user already exists
    const existingUserWithEmail = await this.getUserByEmail(email)
    if (existingUserWithEmail) throw new Error(`user with this email ${email} already exists`)
    // Generate salt and hash the password
    const salt = randomBytes(16).toString('hex')
    const hash = createHmac('sha256', salt).update(password).digest('hex')
    // Insert the new user into the database
    const userInsertResult = await db.insert(usersTable).values({
      fullName,
      email,
      password: hash,
      salt,
    }).returning({
      id: usersTable.id,
    })

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) throw new Error('There is issue while creating the user')

    return {
      id: String(userInsertResult[0].id)
    }
  }

  public async findById(id: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return result[0] ?? null;
  }

  public async upsertGoogleUser(identity: {
    providerAccountId: string;
    email: string;
    fullName: string;
    profileImageUrl?: string;
  }) {
    const existingAccount = await db
      .select({ user: usersTable })
      .from(accountsTable)
      .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
      .where(and(
        eq(accountsTable.provider, "google"),
        eq(accountsTable.providerAccountId, identity.providerAccountId),
      ));

    if (existingAccount[0]?.user) return existingAccount[0].user;

    const existingUser = await this.getUserByEmail(identity.email);
    const user = existingUser ?? (await db.insert(usersTable).values({
      fullName: identity.fullName.slice(0, 80),
      email: identity.email.toLowerCase(),
      emailVerified: true,
      profileImageUrl: identity.profileImageUrl,
    }).returning())[0];

    if (!user) throw new Error("Unable to create Google user");

    await db.insert(accountsTable).values({
      userId: user.id,
      provider: "google",
      providerAccountId: identity.providerAccountId,
      providerEmail: identity.email.toLowerCase(),
    });
    return user;
  }

  public async getGoogleAccountForUser(userId: string) {
  const result = await db
    .select()
    .from(accountsTable)
    .where(and(
      eq(accountsTable.userId, userId),
      eq(accountsTable.provider, "google"),
    ));

  return result[0] ?? null;
}

public async saveGmailCredentials(userId: string, credentials: {
  providerAccountId: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  grantedScopes: string[];
}) {
  const account = await this.getGoogleAccountForUser(userId);

  if (!account || account.providerAccountId !== credentials.providerAccountId) {
    throw new Error("Gmail account does not match the signed-in user");
  }

  await db.update(accountsTable)
    .set({
      providerEmail: credentials.email,
      gmailAccessToken: credentials.accessToken ?? account.gmailAccessToken,
      gmailRefreshToken: credentials.refreshToken
        ? encryptGmailToken(credentials.refreshToken)
        : account.gmailRefreshToken,
      gmailTokenExpiresAt:
        credentials.tokenExpiresAt ?? account.gmailTokenExpiresAt,
      gmailGrantedScopes: credentials.grantedScopes.join(" "),
    })
    .where(eq(accountsTable.id, account.id));
}

public async getGmailCredentials(userId: string) {
  const account = await this.getGoogleAccountForUser(userId);

  if (!account?.gmailRefreshToken) {
    return null;
  }

  return {
    account,
    refreshToken: decryptGmailToken(account.gmailRefreshToken),
  };
}

public async disconnectGmail(userId: string) {
  const account = await this.getGoogleAccountForUser(userId);

  if (!account) return;

  if (account.gmailRefreshToken) {
    try {
      await revokeGmailGrant(decryptGmailToken(account.gmailRefreshToken));
    } catch {}
  }

  await db.update(accountsTable)
    .set({
      gmailAccessToken: null,
      gmailRefreshToken: null,
      gmailTokenExpiresAt: null,
      gmailGrantedScopes: null,
    })
    .where(eq(accountsTable.id, account.id));
}
}

export default UserService;