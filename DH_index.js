// スクロールに応じたフェードインアニメーション
const sections = document.querySelectorAll('.fade-in-section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { rootMargin: '0px', threshold: 0.1 });
sections.forEach(section => {
    observer.observe(section);
});

// Gemini API 関連のスクリプト
const generateButton = document.getElementById('generate-button');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const resultsContainer = document.getElementById('catchphrase-results');

generateButton.addEventListener('click', async () => {
    // UIリセット
    loader.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    resultsContainer.innerHTML = '';
    generateButton.disabled = true;

    // 入力値の取得
    const businessDesc = document.getElementById('business-desc').value;
    const targetAudience = document.getElementById('target-audience').value;
    const keyStrength = document.getElementById('key-strength').value;

    if (!businessDesc || !targetAudience || !keyStrength) {
        showError('すべての項目を入力してください。');
        generateButton.disabled = false;
        loader.classList.add('hidden');
        return;
    }

    // Geminiへのプロンプト作成
    const prompt = `
あなたはプロのコピーライターです。以下の情報に基づいて、ウェブサイトのランディングページ（LP）で顧客を惹きつける魅力的なキャッチコピーを5つ提案してください。各提案は短く、インパクトのあるものにしてください。提案は番号付きリストで、説明は不要です。

# 入力情報
- 事業内容: ${businessDesc}
- ターゲット顧客: ${targetAudience}
- 一番の強み・売り: ${keyStrength}

# 出力形式
1. [キャッチコピー]
2. [キャッチコピー]
3. [キャッチコピー]
4. [キャッチコピー]
5. [キャッチコピー]
`;

    try {
        // Gemini API呼び出し
        const apiKey = ""; // APIキーは空のままにします
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            displayResults(text);
        } else {
            throw new Error('AIからの有効な回答がありませんでした。');
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        showError('キャッチコピーの生成に失敗しました。時間をおいて再度お試しください。');
    } finally {
        loader.classList.add('hidden');
        generateButton.disabled = false;
    }
});

function displayResults(text) {
    // AIの出力を解析して表示
    const catchphrases = text.split('\n').filter(line => line.trim() !== '');
    const resultTitle = document.createElement('h3');
    resultTitle.className = 'text-xl font-bold text-center mb-4 gradient-text';
    resultTitle.textContent = 'AIからの提案';
    resultsContainer.appendChild(resultTitle);

    catchphrases.forEach(phrase => {
        const p = document.createElement('p');
        p.className = 'glass-card p-4 text-center text-lg hover:bg-gray-700/50 transition-colors';
        // 番号などを除去
        p.textContent = phrase.replace(/^\d+\.\s*/, '');
        resultsContainer.appendChild(p);
    });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}
