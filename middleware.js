// Mock middleware - no authentication required
export default function middleware(req) {
  // Allow all requests to pass through
  return;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
