import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const altText = "TetrisTravel Logo";

export default function Logo({
  className = "",
  width = 180,
  height = 60,
}: LogoProps) {
  return (
    <Image
      src="/assets/logo.png"
      alt={altText}
      width={width}
      height={height}
      className={className}
      priority
      style={{ background: "transparent" }}
    />
  );
}
