export const playNotificationSound = () => {
  console.log("SOUND FUNCTION CALLED"); // 🔥

  const audio = new Audio("/sounds/notify.mp3");

  audio.play().catch((err) => {
    console.log("PLAY ERROR:", err);
  });
};