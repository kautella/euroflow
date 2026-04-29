import express from "express";

const PORT = process.env.PORT ?? 3001;
const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ ok: true });
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
