import { cn } from "@/lib/utils";

export function HugIcon( {className}: {className?: string}) {
  return (
    <svg className={cn("!size-6", className)} fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7.146 8.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .707l-3 3a.5.5 0 1 1-.708-.707L9.793 11.5 7.146 8.854a.5.5 0 0 1 0-.708m9.708 0a.5.5 0 0 1 0 .708L14.207 11.5l2.647 2.646a.5.5 0 0 1-.708.707l-3-3a.5.5 0 0 1 0-.707l3-3a.5.5 0 0 1 .708 0"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function FillIcon( {className}: {className?: string}) {
  return (
    <svg className={cn("!size-6", className)} fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9.354 8.146a.5.5 0 0 1 0 .708L7.207 11h9.586l-2.146-2.146a.5.5 0 0 1 .707-.708l3 3a.5.5 0 0 1 0 .707l-3 3a.5.5 0 0 1-.708-.707L16.793 12H7.207l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function FixedIcon( {className}: {className?: string}) {
  return (
    <svg className={cn("!size-6", className)} fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16.5 8.5a.5.5 0 0 1 .5.5v5a.5.5 0 1 1-1 0v-2H7v2a.5.5 0 0 1-1 0V9a.5.5 0 0 1 1 0v2h9V9a.5.5 0 0 1 .5-.5"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function PaddingIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 9.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zm9 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zm-8-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m.5 8.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function PaddingSideIcon({
  side,
}: {
  side: "top" | "right" | "bottom" | "left";
}) {
  return (
    <svg
      className={cn(
        "!size-6",
        side === "left" && "rotate-0",
        side === "top" && "rotate-90",
        side === "right" && "rotate-180",
        side === "bottom" && "-rotate-90"
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7.5a.5.5 0 0 0-1 0v9a.5.5 0 0 0 1 0zm5 3.5v2h-2v-2zm0-1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function PaddingAxisIcon({ axis }: { axis: "x" | "y" }) {
  return (
    <svg
      className={cn(
        "!size-6",
        axis === "x" && "rotate-0",
        axis === "y" && "rotate-90"
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7.5a.5.5 0 0 0-1 0v9a.5.5 0 0 0 1 0zm8.5-.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5M13 13v-2h-2v2zm1-2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function OpacityIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1M6 8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm8.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M13 10.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1.5.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-2a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m2-4a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-.5 2.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function CornerRadiusIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.9 6h-.02c-.403 0-.735 0-1.006.022-.28.023-.54.072-.782.196a2 2 0 0 0-.874.874c-.124.243-.173.501-.196.782C6 8.144 6 8.477 6 8.88v.62a.5.5 0 0 0 1 0v-.6c0-.428 0-.72.019-.944.018-.22.05-.332.09-.41a1 1 0 0 1 .437-.437c.078-.04.19-.072.41-.09C8.18 7 8.472 7 8.9 7h.6a.5.5 0 0 0 0-1zm6.2 0h.02c.403 0 .735 0 1.006.022.281.023.54.072.782.196a2 2 0 0 1 .874.874c.124.243.173.501.196.782.022.27.022.603.022 1.005V9.5a.5.5 0 0 1-1 0v-.6c0-.428 0-.72-.019-.944-.018-.22-.05-.332-.09-.41a1 1 0 0 0-.437-.437c-.078-.04-.19-.072-.41-.09A13 13 0 0 0 15.1 7h-.6a.5.5 0 0 1 0-1zm.02 12h-.62a.5.5 0 0 1 0-1h.6c.428 0 .72 0 .944-.019.22-.018.332-.05.41-.09a1 1 0 0 0 .437-.437c.04-.078.072-.19.09-.41.019-.225.019-.516.019-.944v-.6a.5.5 0 0 1 1 0v.62c0 .403 0 .735-.022 1.006-.023.281-.072.54-.196.782a2 2 0 0 1-.874.874c-.243.124-.501.173-.782.196-.27.022-.603.022-1.005.022M8.9 18h-.02c-.403 0-.735 0-1.006-.022-.281-.023-.54-.072-.782-.196a2 2 0 0 1-.874-.874c-.124-.243-.173-.501-.196-.782A13 13 0 0 1 6 15.12v-.62a.5.5 0 0 1 1 0v.6c0 .428 0 .72.019.944.018.22.05.332.09.41a1 1 0 0 0 .437.437c.078.04.19.072.41.09.225.019.516.019.944.019h.6a.5.5 0 0 1 0 1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function BorderWidthIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6 6.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5M7 10v1h10v-1zm-.25-1a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75zM7 17v-2h10v2zm-1-2.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function ShadowIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M16.204 6.01A2 2 0 0 1 18 8v8l-.01.204a2 2 0 0 1-1.786 1.785L16 18H8l-.204-.01a2 2 0 0 1-1.785-1.786L6 16V8a2 2 0 0 1 1.796-1.99L8 6h8zM8 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z"
      ></path>
      <path
        fill="currentColor"
        className="opacity-30"
        d="M16 4a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zM8 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
      ></path>
    </svg>
  );
}

export function LineHeightIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5 5.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5m0 13a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5M8.564 16H9.58l.804-2.266h3.236L14.424 16h1.016l-2.938-8h-1zm4.75-3.125-1.28-3.61h-.063l-1.282 3.61z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export function LetterSpacingIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.5 6a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5M8.564 16H9.58l.804-2.266h3.236L14.424 16h1.016l-2.938-8h-1zm4.75-3.125-1.28-3.61h-.063l-1.282 3.61z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
