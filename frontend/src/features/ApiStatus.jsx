import { useEffect, useState } from 'react';

export default function ApiStatus() {
    const [message, setMessage] = useState('Vérification en cours...');

    useEffect(() => {
        async function checkApi() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/health`
                );

                if (!response.ok) {
                    throw new Error('Réponse HTTP ' + response.status);
                }

                const data = await response.json();

                setMessage(data.status === 'ok'
                    ? 'Backend connecté'
                    : 'Réponse inattendue');
            } catch (error) {
                setMessage('Connexion impossible : ' + error.message);
            }
        }

        checkApi();
    }, []);

    return <p className="p-8 text-xl text-black-300 bg-white">{message}</p>;
}