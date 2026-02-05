import type { FC } from "react";
import "./DeclareDepositConformedButton.css";

interface DeclareDepositConformedButtonProps {
  borrowId: number;
  onClick: (borrowId: number) => void;
  isLoading?: boolean;
}

const DeclareDepositConformedButton: FC<DeclareDepositConformedButtonProps> = ({
  borrowId,
  onClick,
  isLoading = false,
}) => {
  return (
    <button
      type="button"
      className="button"
      onClick={() => onClick(borrowId)}
      disabled={isLoading}
      title="Confirm deposit conformed"
    >
      {isLoading ? "Processing..." : "Confirm Conformed"}
    </button>
  );
};

export default DeclareDepositConformedButton;
