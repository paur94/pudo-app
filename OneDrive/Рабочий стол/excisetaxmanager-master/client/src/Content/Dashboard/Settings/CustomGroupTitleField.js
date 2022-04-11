import React from "react";
import { TextField } from "@shopify/polaris";
import {
  getErrors,
  getPathFromAncestors,
  getValue
} from "@additionapps/polaris-form-builder";

export const CustomGroupTitleField = ({ field, state, actions, ancestors }) => {
  const fieldProps = {
    ...field.config,
    label: field.config.label,
  };

  return <label {...fieldProps} >{fieldProps.label}</label>;
};
