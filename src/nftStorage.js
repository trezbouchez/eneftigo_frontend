import { NFTStorage } from 'nft.storage'

// Paste your NFT.Storage API key into the quotes:
const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDMyNDI2MmU0NjQ0YzZBODBDM2RjODg3QTgwM0FkYzMxOEFDNmMwOTUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2Mjk4NjQ5MzA2OCwibmFtZSI6ImVuZWZ0aWdvIn0.manBXWhFILmvOaG5juuo1SWTAWsENjRUXgmz8hgWwmM'

/**
  * Reads an image file from `file` and stores an NFT with the given name and description.
  * @param {string} image the file handle
  * @param {string} name a name for the NFT
  * @param {string} description a text description for the NFT
  */

export async function storeNFT(image, name, description) {
    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    // call client.store, passing in the image & metadata
    return nftstorage.store({
        image,
        name,
        description,
    })
}

export async function storeImage(image) {
  // create a new NFTStorage client using our API key
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

  // call client.store, passing in the image & metadata
  return await nftstorage.storeBlob(image);
}