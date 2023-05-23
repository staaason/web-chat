import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { selectUid, setUid } from "../features/filterSlice";

function Checkout() {
  let dispatch = useDispatch();
  const uid = useSelector(selectUid);

  useEffect(() => {
    console.log(uid);
  }, [uid]);

  const handleButton = () => {
    dispatch(
      setUid({
        uid: uuid(),
      })
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
      {uid}
      <button onClick={handleButton}>Click</button>
    </div>
  );
}

export default Checkout;
