import { FC } from "react";
import { Card, Spinner } from "@nextui-org/react"; // Import NextUI Card, Button, and Spinner components
import { button as buttonStyles } from "@nextui-org/theme";

interface SuccessMessageCardProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void; // Callback function for dismissing the card
  loading?: boolean; // Optional loading prop
}

const SuccessMessageCard: FC<SuccessMessageCardProps> = ({
  message,
  type,
  onDismiss,
  loading = false,
}) => {
  // Conditional card styles for success or error messages
  const cardStyle =
    type === "success" ? "bg-green-100" : "bg-red-100 text-red-800";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {" "}
      {/* Blur the background */}
      <Card
        isBlurred
        className={`p-6 rounded-lg shadow-md max-w-md text-center ${cardStyle}`}
      >
        {loading ? (
          <Spinner className="mb-4" color="success" size="lg" /> // Display a spinner while loading
        ) : (
          <p className="mb-4">{message}</p>
        )}
        <button
          className={`${buttonStyles({
            color: "success",
            radius: "full",
            variant: "shadow",
          })} md:mx-20`}
          disabled={loading} // Disable the button while loading
          onClick={onDismiss} // Use onClick to dismiss the card
        >
          {loading ? "Loading..." : "Ok"}
        </button>
      </Card>
    </div>
  );
};

export default SuccessMessageCard;
