import { useState } from 'react';
import { BounceLoader } from 'react-spinners';
import { storeImage } from 'nftStorage';
import nft_media_placeholder from 'assets/nft_media_placeholder.png';
import plus_icon from 'assets/plus_icon.png';
import icon_close_on from 'assets/close_on.png';

export function IpfsImage({ initialUrl, onImageUrlChange }) {
    const [busy, setBusy] = useState(false);
    const [imageUrl, setImageUrl] = useState(initialUrl);

    const onSelectFile = (e) => {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = "image/png, image/jpeg";
        input.onchange = (e) => {
            setBusy(true);
            setImageUrl(null);
            if (onImageUrlChange)   
                onImageUrlChange(null);
            const image = e.target.files[0];
            // Promise.resolve("cid")
            storeImage(image)
                .then((cid) => {
                    setBusy(false);
                    const newImageUrl = "https://ipfs.io/ipfs/" + cid;
                    setImageUrl(newImageUrl);
                    if (onImageUrlChange)
                        onImageUrlChange(newImageUrl);
                })
                .catch((error) => {
                    console.log("ERROR: " + error);
                })
        }
        input.click();
    };

    return (
        <div style={{ position: "relative", width: "200px", height: "200px", margin: "auto" }}>
            {
                imageUrl ?
                    <div style={{ margin: "auto", width: "200px", height: "200px", position: "relative" }}>
                        <img
                            style={{ objectFit: "cover", borderRadius: "5px", width: "100%", height: "100%" }}
                            src={imageUrl}
                            alt="NFT"
                        />
                        {
                            onImageUrlChange &&
                            <img
                                style={{
                                    padding: "5px",
                                    borderRadius: "10px",
                                    backgroundColor: "var(--eneftigo-black)",
                                    position: "absolute",
                                    top: "-10px",
                                    right: "-10px",
                                }}
                                src={icon_close_on}
                                width="20"
                                height="20"
                                alt="X"
                                onMouseEnter={(e) => e.target.style.scale = 1.2}
                                onMouseLeave={(e) => e.target.style.scale = 1.0}
                                onClick={() => setImageUrl(null)}
                            />
                        }
                    </div> :
                    <div>
                        <img
                            style={{ borderRadius: "5px" }}
                            position="absolute"
                            width="200px"
                            height="200px"
                            src={nft_media_placeholder}
                            alt="NFT"
                            onClick={onSelectFile}
                        />
                        {
                            !busy &&
                            <img
                                src={plus_icon}
                                width="50"
                                height="50"
                                style={{ position: "absolute", top: "75px", left: "75px" }}
                                onClick={onSelectFile}
                                alt="+"
                            />
                        }
                    </div>
            }
            {
                !imageUrl &&
                <div>
                    <p style={{ fontSize: "10px", opacity: "50%", color: "var(--eneftigo-light-grey)", position: "absolute", top: "70%", left: "50%", transform: "translate(-50%, -50%)" }}>
                        {busy ? "UPLOADING TO IPFS" : "TAP TO BROWSE"}
                    </p>
                </div>
            }
            {
                busy &&
                <div><BounceLoader color="var(--eneftigo-black)" style={{ position: "absolute", top: "35%", left: "35%" }} /></div>
            }
        </div>
    );
}