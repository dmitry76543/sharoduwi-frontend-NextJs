import { CursorToggle } from "@/components/CursorToggle";

export function ConfettiCursor() {
  return (
    <>
      <canvas id="confetti" />
      <div id="cursor">
        <div className="cur-balloon" />
      </div>
      <CursorToggle />
    </>
  );
}
