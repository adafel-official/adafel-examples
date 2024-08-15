import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import { OpenDataLibrary } from "@adafel/opendatalibrary-js-sdk";
import { promises as fs } from "fs";

const privateKey = "0x2722..."; // optional

async function main() {
  // Initialize the Adafel Open Data Library client
  const client = new OpenDataLibrary({
    account: privateKeyToAccount(privateKey), // optional
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
  });

  // Read CSV file
  const content = await fs.readFile(
    `/Users/prajjawalkhandelwal/Prajjawal/adafel-tutorial/heart-disease.csv`
  );

  // Upload data to IPFS and return data CID
  const cid = await client.uploadCidDataToIPFS(content);

  // Train linear regression model by passing data CID
  // Training features indices - 0, 1 and 2
  // Label index - 3
  // Trained model name = "my_linear_regression_model"
  const tx = await client.trainLinearRegressionFromCid(
    client.getCidBytes(cid),
    [0n, 1n, 2n],
    3n,
    "my_linear_regression_model"
  );
  console.log("tx: ", tx);

  // Wait for transactions and get receipt after 3 confirmations
  const receipt = await client.waitForTransaction(tx);
  console.log("receipt: ", receipt);

  // Run predictions by passing in model name and test data
  const prediction = await client.predictLinearRegressionOnchainModel(
    "my_linear_regression_model",
    [
      [63n, 1n, 3n],
      [37n, 1n, 2n],
    ]
  );
  console.log("prediction: ", prediction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
