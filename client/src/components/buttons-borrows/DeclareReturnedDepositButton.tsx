import type { FC } from "react";
import "./DeclareReturnedDepositButton.css";

interface DeclareReturnedDepositButtonProps {
  borrowId: number;
  onClick: (borrowId: number) => void;
  isLoading?: boolean;
}

const DeclareReturnedDepositButton: FC<DeclareReturnedDepositButtonProps> = ({
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
      title="Declare deposit returned"
    >
      {isLoading ? "Processing..." : "Declare Returned"}
    </button>
  );
};

export default DeclareReturnedDepositButton;
