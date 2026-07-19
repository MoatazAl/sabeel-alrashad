import { redirect } from "next/navigation";

type SheikhRedirectProps = {
  params: Promise<{ slug: string }>;
};

export default async function SheikhRedirect({ params }: SheikhRedirectProps) {
  const { slug } = await params;
  redirect(`/teachers/${slug}`);
}
