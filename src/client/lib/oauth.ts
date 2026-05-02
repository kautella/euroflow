import type { CatalogBank } from "../seed/banks";

export type OAuthState = {
	bank: CatalogBank;
	step: 1 | 2 | 3;
	reauth?: boolean;
};

export const OAUTH_REDIRECT_DELAY_MS = 1800;

export function oauthAdvance(state: OAuthState): OAuthState {
	const next = (state.step < 3 ? state.step + 1 : state.step) as 1 | 2 | 3;
	return { ...state, step: next };
}
