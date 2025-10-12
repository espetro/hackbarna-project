import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const altText = "TetrisTravel Logo";

export default function Logo({
  className = "",
  width = 120,
  height = 40,
}: LogoProps) {
  return (
    <Image
      src="/assets/logo.svg"
      alt={altText} // alt text as a constant outside JSX
      width={width}
      height={height}
      className={className}
      priority
      style={{ background: "transparent" }}
    />
  );
}
