import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f9]">
      <SignIn />
    </div>
  );
}
