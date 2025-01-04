import express from 'express';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import fetch from 'node-fetch';

const GECKOTERMINAL_PRICE_URL = "https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price";
const GECKOTERMINAL_NAME_URL = "https://api.geckoterminal.com/api/v2/networks/solana/tokens";

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

const getUsdToIdrExchangeRate = async () => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr');
        if (!response.ok) {
            console.error("Error fetching exchange rate");
            return 0;
        }
        const data = await response.json();
        return data.usd.idr;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return 0;
    }
};

const getAccountInfo = async (walletAddress) => {
    try {
        const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
        const ownerPublicKey = new PublicKey(walletAddress);
        const tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
            programId: tokenProgramId,
        });
        return tokenAccounts.value;
    } catch (error) {
        console.error("Error fetching account info:", error);
        return null;
    }
};

const getTokenPrice = async (mint) => {
    try {
        const response = await fetch(`${GECKOTERMINAL_PRICE_URL}/${mint}`);
        const data = await response.json();
        return data.data.attributes.token_prices[mint] || 0;
    } catch (error) {
        console.error("Error fetching token price:", error);
        return 0;
    }
};

const getTokenName = async (mint) => {
    try {
        const response = await fetch(`${GECKOTERMINAL_NAME_URL}/${mint}`);
        const data = await response.json();
        return data.data.attributes.name || "Unknown Token";
    } catch (error) {
        return "Unknown Token";
    }
};

const calculateNetWorth = async (walletAddress) => {
    const accountInfo = await getAccountInfo(walletAddress);
    if (!accountInfo || accountInfo.length === 0) {
        return { tokens: [], priceMap: {}, usdToIdrRate: 0, nameMap: {}, significantTokens: [] };
    }

    const tokens = accountInfo.map(account => {
        const mint = account.account.data.parsed.info.mint;
        const amount = parseFloat(account.account.data.parsed.info.tokenAmount.uiAmount || 0);
        return { mint, amount };
    }).filter(token => token.amount > 0);

    if (tokens.length === 0) {
        return { tokens: [], priceMap: {}, usdToIdrRate: 0, nameMap: {}, significantTokens: [] };
    }

    const tokenPricesPromises = tokens.map(token => getTokenPrice(token.mint));
    const tokenNamesPromises = tokens.map(token => getTokenName(token.mint));

    const tokenPrices = await Promise.all(tokenPricesPromises);
    const tokenNames = await Promise.all(tokenNamesPromises);

    const priceMap = {};
    const nameMap = {};

    tokens.forEach((token, index) => {
        priceMap[token.mint] = tokenPrices[index];
        nameMap[token.mint] = tokenNames[index];
    });

    const usdToIdrRate = await getUsdToIdrExchangeRate();
    const significantTokens = tokens.filter(token => (token.amount * priceMap[token.mint] || 0) >= 1);

    return {
        tokens,
        priceMap,
        usdToIdrRate,
        nameMap,
        significantTokens
    };
};

app.get("/", async (req, res) => {
    const walletAddress = req.query.address;

    if (!walletAddress) {
        return res.render("index", {
            message: "Please enter a wallet address",
            tokens: [],
            priceMap: {},
            usdToIdrRate: 0,
            nameMap: {}
        });
    }

    try {
        const { tokens, priceMap, usdToIdrRate, nameMap, significantTokens } = await calculateNetWorth(walletAddress);

        if (significantTokens.length === 0) {
            return res.render("index", {
                message: "No significant tokens found in this wallet.",
                tokens: [],
                priceMap: {},
                usdToIdrRate: 0,
                nameMap: {},
                address: walletAddress
            });
        }

        res.render("index", {
            tokens: significantTokens,
            priceMap: priceMap,
            usdToIdrRate: usdToIdrRate,
            nameMap: nameMap,
            message: "",
            address: walletAddress
        });
    } catch (error) {
        res.render("index", {
            message: "Invalid wallet address or error fetching data",
            tokens: [],
            priceMap: {},
            usdToIdrRate: 0,
            nameMap: {},
            address: walletAddress
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});