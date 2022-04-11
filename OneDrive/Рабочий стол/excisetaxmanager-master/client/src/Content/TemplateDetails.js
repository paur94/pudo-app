import React from "react";
import {
    useParams
  } from "react-router-dom";



export default function Templates() {
    let { TemplateId } = useParams();
    return <div>{TemplateId}</div>
}