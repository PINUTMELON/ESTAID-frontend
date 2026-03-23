import { redirect } from "next/navigation";

export default function MainRedirectPage() {
  /**
   * /main 접속 시 /main/projects로 즉시 리다이렉트합니다.
   */
  redirect("/main/projects");
}
