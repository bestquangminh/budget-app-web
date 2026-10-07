import Image from "next/image";

export default function Logo() {
    return (
        <div className="flex items-center gap-3">
            <Image src="/brand/logo-mark.svg" alt="" width={36} height={36} priority />
            <span className="text-xl font-extrabold tracking-tight text-foreground">
                <span className="text-primary">Budget</span>Buddy
            </span>
        </div>
    )
}
