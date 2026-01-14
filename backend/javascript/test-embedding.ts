async function testRawEmbedding() {
    const url = 'http://localhost:1234/v1/embeddings';
    const body = {
        model: 'text-embedding-nomic-embed-text-v1.5',
        input: 'This is a test document.'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log('Raw API Response:', JSON.stringify(data));
        const vec = data.data[0].embedding;
        console.log('Vector Length:', vec.length);
        console.log('Vector (first 5):', vec.slice(0, 5));
        console.log('Sum of absolute values:', vec.reduce((a, b) => a + Math.abs(b), 0));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testRawEmbedding();
