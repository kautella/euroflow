export type CatalogBank = {
	id: string;
	name: string;
	bic: string;
	country: string;
	brand: string;
	initials: string;
	maxDays: number;
};

export type ConnectedAccount = {
	id: number;
	bankId: string;
	bankName: string;
	brandColor: string;
	brandInitials: string;
	country: string;
	consentId: string;
	name: string;
	iban: string;
	type: string;
	actualMapping: string;
	expiresInDays: number;
	status: "ok" | "warn" | "err";
	statusLabel: string;
};

export type CertInfo = {
	cn: string;
	issuer: string;
	expires: string;
};

export const cert: CertInfo = {
	cn: "euroflow-client.example.com",
	issuer: "OPEN BANKING EUROPE CA",
	expires: "2027-03-15",
};

export const banksCatalog: CatalogBank[] = [
	// DE
	{
		id: "n26",
		name: "N26",
		bic: "NTSBDEB1",
		country: "DE",
		brand: "#1a1a1a",
		initials: "N26",
		maxDays: 90,
	},
	{
		id: "deutsche",
		name: "Deutsche Bank",
		bic: "DEUTDEDB",
		country: "DE",
		brand: "#0018a8",
		initials: "DB",
		maxDays: 90,
	},
	{
		id: "commerzbank",
		name: "Commerzbank",
		bic: "COBADEFF",
		country: "DE",
		brand: "#ffcc00",
		initials: "CB",
		maxDays: 90,
	},
	{
		id: "sparkasse_de",
		name: "Sparkasse",
		bic: "BELADEBE",
		country: "DE",
		brand: "#ff0000",
		initials: "SK",
		maxDays: 90,
	},
	{
		id: "ing_de",
		name: "ING-DiBa",
		bic: "INGDDEFF",
		country: "DE",
		brand: "#ff6200",
		initials: "ING",
		maxDays: 90,
	},
	// FR
	{
		id: "bnp",
		name: "BNP Paribas",
		bic: "BNPAFRPP",
		country: "FR",
		brand: "#009966",
		initials: "BNP",
		maxDays: 90,
	},
	{
		id: "ca",
		name: "Crédit Agricole",
		bic: "AGRIFRPP",
		country: "FR",
		brand: "#008a00",
		initials: "CA",
		maxDays: 90,
	},
	{
		id: "sg",
		name: "Société Générale",
		bic: "SOGEFRPP",
		country: "FR",
		brand: "#e60028",
		initials: "SG",
		maxDays: 90,
	},
	// PT
	{
		id: "bcp",
		name: "Millennium BCP",
		bic: "BCOMPTPL",
		country: "PT",
		brand: "#e30613",
		initials: "BCP",
		maxDays: 90,
	},
	{
		id: "cgd",
		name: "Caixa Geral de Depósitos",
		bic: "CGDIPTPL",
		country: "PT",
		brand: "#006633",
		initials: "CGD",
		maxDays: 90,
	},
	{
		id: "santander_pt",
		name: "Banco Santander",
		bic: "BSCHPTPL",
		country: "PT",
		brand: "#ec0000",
		initials: "SAN",
		maxDays: 90,
	},
	// NL
	{
		id: "ing_nl",
		name: "ING",
		bic: "INGBNL2A",
		country: "NL",
		brand: "#ff6200",
		initials: "ING",
		maxDays: 90,
	},
	{
		id: "abn",
		name: "ABN AMRO",
		bic: "ABNANL2A",
		country: "NL",
		brand: "#009ee0",
		initials: "ABN",
		maxDays: 90,
	},
	// LT (Revolut)
	{
		id: "revolut",
		name: "Revolut",
		bic: "REVOGB21",
		country: "GB",
		brand: "#0075eb",
		initials: "REV",
		maxDays: 90,
	},
];

export const connectedBankGroups: {
	bank: {
		id: string;
		name: string;
		brand: string;
		initials: string;
		country: string;
	};
	consentId: string;
	accounts: ConnectedAccount[];
}[] = [
	{
		bank: {
			id: "bcp",
			name: "Millennium BCP",
			brand: "#e30613",
			initials: "BCP",
			country: "PT",
		},
		consentId: "sess_a1b2...c3d4",
		accounts: [
			{
				id: 1,
				bankId: "bcp",
				bankName: "Millennium BCP",
				brandColor: "#e30613",
				brandInitials: "BCP",
				country: "PT",
				consentId: "sess_a1b2...c3d4",
				name: "Checking",
				iban: "PT50 0010 0001 2345 6789 1510 2",
				type: "checking",
				actualMapping: "Main Checking",
				expiresInDays: 162,
				status: "ok",
				statusLabel: "OK",
			},
		],
	},
	{
		bank: {
			id: "n26",
			name: "N26",
			brand: "#1a1a1a",
			initials: "N26",
			country: "DE",
		},
		consentId: "sess_b8a4...3f1e",
		accounts: [
			{
				id: 2,
				bankId: "n26",
				bankName: "N26",
				brandColor: "#1a1a1a",
				brandInitials: "N26",
				country: "DE",
				consentId: "sess_b8a4...3f1e",
				name: "Main Account",
				iban: "DE89 3704 0044 0532 0130 00",
				type: "checking",
				actualMapping: "N26 EUR",
				expiresInDays: 5,
				status: "warn",
				statusLabel: "EXPIRING",
			},
		],
	},
	{
		bank: {
			id: "revolut",
			name: "Revolut",
			brand: "#0075eb",
			initials: "REV",
			country: "GB",
		},
		consentId: "sess_f9e8...7d6c",
		accounts: [
			{
				id: 3,
				bankId: "revolut",
				bankName: "Revolut",
				brandColor: "#0075eb",
				brandInitials: "REV",
				country: "GB",
				consentId: "sess_f9e8...7d6c",
				name: "EUR Pocket",
				iban: "LT12 3250 0718 9900 3578",
				type: "checking",
				actualMapping: "Revolut EUR",
				expiresInDays: 89,
				status: "ok",
				statusLabel: "OK",
			},
		],
	},
];

export const countries = [
	"DE",
	"FR",
	"NL",
	"ES",
	"IT",
	"BE",
	"AT",
	"PT",
	"IE",
	"FI",
	"SE",
	"DK",
	"NO",
	"PL",
	"GB",
] as const;
