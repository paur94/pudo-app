import React from "react";
import { TextField } from "@shopify/polaris";
import {
  getErrors,
  getPathFromAncestors,
  getValue
} from "@additionapps/polaris-form-builder";

export const CustomField = ({ field, state, actions, ancestors }) => {
  const fieldProps = {
    ...field.config,
    value: getValue(state.model, field, ancestors),
    error: getErrors(state.errors, field, ancestors),
    label: field.config.label,
    focused: state.focus === getPathFromAncestors(field, ancestors),
    onFocus: () => {
      actions.setFocus(field, ancestors);
    },
    onChange: value => {
      actions.updateField(value, field, ancestors);
    }
  };

  return <TextField {...fieldProps} />;
};
