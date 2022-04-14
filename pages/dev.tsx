import { NextPage } from "next";
import React, { useState } from "react";
import { CSSTransition } from "react-transition-group";

const Example: NextPage = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ paddingTop: "2rem" }}>
      <button onClick={() => setLoading((loading) => !loading)}>
        {loading ? "Hide" : "Show"} Message
      </button>

      {loading && <div className="bg-red-200">Loading...</div>}

      <CSSTransition
        in={!loading}
        timeout={300}
        classNames="alert"
        unmountOnExit
        mountOnEnter
      >
        <div className="bg-red-200">Animated alert message</div>
      </CSSTransition>
    </div>
  );
};

export default Example;
