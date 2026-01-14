import Link from "next/link"
import { Icons } from "@/components/icons"
import { siteConfig } from "@/lib/site"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Icons.logo className="size-4" />
            </div>
            {siteConfig.name}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {children}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.3] dark:opacity-35 dark:grayscale-0 dark:lg:opacity-75"
          src="/video/dna-clip.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-transparent to-background/20 dark:from-background/10 dark:via-transparent dark:to-background/5" />
      </div>
    </div>
  )
}
