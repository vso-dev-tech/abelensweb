import React from "react";
import { styled } from "@mui/material/styles";
import { InputLabel } from "@mui/material";

const FormHeaderWrapper = styled("div")(() => ({
  display: "flex",
  marginTop: "2.5rem",
  "& .MuiInputLabel-root": {
    color: "#22222A",
    fontSize: "13px",
    fontWeight: "500",
  },
  "& .MuiButtonBase-root": {
    padding: 0,
    "& .MuiSvgIcon-root": {
      color: "#0278D5",
      fontSize: "15px",
      marginLeft: "5px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  },

  "& .FuseSettings-group": {},
}));

function FormHeader(props: any) {
  const { required, inputLabel, ...restProps } = props;
  return (
    <FormHeaderWrapper className="header-wrapper" {...restProps}>
      {inputLabel ? <InputLabel {...restProps}>{inputLabel} {required && '*'}</InputLabel> : null}
    </FormHeaderWrapper>
  );
}

export default FormHeader;
