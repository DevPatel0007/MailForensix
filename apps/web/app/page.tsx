import { api } from "~/trpc/server";

export default async function Home() {
 const { message } = await api.test.query({name:'Hello',email: 'hello@gmail.com'});
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h2>Server message: {message}</h2>
      </div>
    </main>
  );
}
