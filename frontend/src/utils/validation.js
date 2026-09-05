export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const BD_PHONE_PATTERN = /^(?:\+88|88)?\s*0?1[3-9]\d{8}$/;
export const NID_PATTERN = /^\d[\d\s-]{9,16}$/;
export const PASSWORD_PATTERN = /^.{6,20}$/;
export const ADDRESS_PATTERN = /^[\w\s,./#-]{5,100}$/;
export const AREA_PATTERN = /^[\w\s,.-]{2,50}$/;
export const JOIN_CODE_PATTERN = /^[A-Z0-9]{6,10}$/;
export const BILL_MONTH_PATTERN = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/;export const BILL_TYPE_PATTERN = /^[A-Za-z\s]{2,30}$/;
export const TRANSACTION_ID_PATTERN = /^TXN-\d{4,10}$/;