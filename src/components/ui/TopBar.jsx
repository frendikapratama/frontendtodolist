import NotificationBell from "./NotificationBell";

export default function TopBar() {
  return (
    <div className="sticky top-0 z-30 bg-transparen ">
      <div className="flex items-center justify-end px-6 pt-3 bg-transparent">
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}
