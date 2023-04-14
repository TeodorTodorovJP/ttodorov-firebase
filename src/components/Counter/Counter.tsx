import React, { useState } from "react";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { decrement, increment, incrementByAmount, incrementAsync, incrementIfOdd, selectCount } from "./counterSlice";
import classes from "./Counter.module.css";
import Card from "../UI/Card";
import { fireStore } from "../../firebase-config";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export function Counter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("2");

  const incrementValue = Number(incrementAmount) || 0;

  // Test it !!!
  const testError = async (error: any) => {
    const errorText = JSON.stringify(error);
    const time = new Date().toString();
    try {
      const userRef = doc(fireStore, "errors", time);

      const timestamp = serverTimestamp();
      await setDoc(userRef, { timestamp, errorText });
    } catch (error) {
      console.error("Error writing Error to Firebase Database", error);
    }
  };

  return (
    <Card additionalClass="counter">
      <div className={classes.counter}>
        <div className={`${classes.row} ${classes.top}`}>
          <button className={classes.button} aria-label="Decrement value" onClick={() => dispatch(decrement())}>
            -
          </button>
          <span className={classes.value}>{count}</span>
          <button className={classes.button} aria-label="Increment value" onClick={() => dispatch(increment())}>
            +
          </button>
        </div>
        <div className={`${classes.row} ${classes.bottom}`}>
          <input
            className={classes.textbox}
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />
          <button className={classes.button} onClick={() => dispatch(incrementByAmount(incrementValue))}>
            Add Amount
          </button>
          <button className={classes.asyncButton} onClick={() => dispatch(incrementAsync(incrementValue))}>
            Add Async
          </button>
          <button className={classes.button} onClick={() => dispatch(incrementIfOdd(incrementValue))}>
            Add If Odd
          </button>
        </div>
      </div>
    </Card>
  );
}
