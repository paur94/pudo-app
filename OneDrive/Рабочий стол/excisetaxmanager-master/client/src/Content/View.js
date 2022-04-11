import React from "react";
import data from '../data/dataSource.json';
import {useParams} from "react-router-dom";

export default function ViewItem() {
    let { ViewID } = useParams();
    const dataItem = data.find(function(el) {
        if ( ViewID == el.ID) {
            return true;
        }
    });
    
    return ( 
        <div>
            <ul>
                <li>{dataItem.Title}</li>
                <li>{dataItem.Strength}</li>
                <li>{dataItem.Price}</li>
                <li>{dataItem.Quantity}</li>
                <li>{dataItem.SKU}</li>
                <li>{dataItem.ProductType}</li>
                <li>{dataItem.Vendor}</li>
                <li>{dataItem.Collections}</li>
                <li><img className="view-image" src={dataItem.Image} /></li>
            </ul> 
        </div>
    );
}