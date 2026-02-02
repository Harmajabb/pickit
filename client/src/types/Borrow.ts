export type borrows = {
  id: number;
  user_id: number;
  announce_id: number;
  borrow_date: Date;
  return_date: Date;
  status: string;
  payment_intent_id?: string;
  deposit_status: string;
  created_at: Date;
  updated_at: Date;
};

export type NewBorrow = {
  user_id: number;
  announce_id: number;
  borrow_date: Date;
  return_date: Date;
  status: string;
  payment_intent_id?: string;
  deposit_status: string;
};

export type BorrowWithAnnounce = borrows & {
  announce_title: string;
  announce_description: string;
  announce_amount_deposit: number;
  announce_start_borrow_date: Date;
  announce_end_borrow_date: Date;
};

export type BorrowStatus = "pending" | "accepted" | "rejected" | "returned";

export type AvailabilityCount = {
  unavailable_days: number;
};
