import {} from '@repo/services/user'
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {createUserWithEmailAndPasswordInputModel , createUserWithEmailAndPasswordOutputModel } from "./model";
import { userService } from '../../services';


const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
  .meta({openapi: { method: "POST", path: getPath('/createUserWithEmailAndPassword'), tags: TAGS }})
  .input(createUserWithEmailAndPasswordInputModel)
  .output(createUserWithEmailAndPasswordOutputModel)
  .mutation(async ({ input }) => {
    const { fullName, email, password } = input;
    const { id } = await userService.createUserWithEmailAndPassword({
      fullName,
      email,
      password,
    });
    return { id };
  }),


});

