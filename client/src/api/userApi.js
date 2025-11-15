import apiClient from "../lib/apiClient";

/**
 * Call backend /api/users/save using the Auth0 access token.
 * 
 * @param {Function} getAccessTokenSilently - from useAuth0()
 * @returns {Promise<Object>} - the user object from your DB
 */
export async function saveUserFromAuth0FE(getAccessTokenSilently) {
  const token = await getAccessTokenSilently();

  const res = await apiClient.post(
    "/users/save",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.user;
}
