import near_icon from 'assets/near_icon_light.png' // relative path to image 
import { yocto_string_to_near } from 'helpers'

export function PriceLabel({ price_yocto }) {
    const priceNear = yocto_string_to_near(price_yocto, 1);
    return (
        <>
            <div className="price" style={{ margin: "auto" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <p>{priceNear}</p>
                    <img style={{ margin: "-2px -1px 0px -2px" }} src={near_icon} width="26" height="26" alt="N" />
                </div>
            </div>
        </>
    )
}