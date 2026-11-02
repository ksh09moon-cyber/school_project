window.ClosetServices = (() => {
function isValidWeather(text) {
            if (!text || text.trim().length < 2) return false;
            const validKeywords = [
                '맑음', '맑은', '구름', '흐림', '흐린', '해', '햇빛',
                '비', '눈', '안개', '우박', '소나기', '호우', '강수',
                '바람', '강풍', '폭염', '한파', '태풍', '더운', '추운',
                '쌀쌀', '선선', '따뜻', '습', '축축', '서늘', '영하', '영상',
                '도', '기온', '체감', '날씨', '건조', '추워', '더워'
            ];
            const invalidKeywords = ['우주', '멸망', '폭발', '외계', '마법', '귀신', '괴물', '좀비', '핵'];
            if (invalidKeywords.some(kw => text.includes(kw))) return false;
            return validKeywords.some(kw => text.includes(kw));
        }

        function getDetailedLaundryGuide(category, itemName) {
            const lower = (itemName || '').toLowerCase();
            if (lower.includes('니트') || lower.includes('가디건') || lower.includes('조끼') || category === '아우터') {
                return "[온도] 찬물 또는 30℃ 이하의 미지근한 물\n[세제] 울샴푸 (중성세제)\n[특징 및 팁] 비틀어 짜지 말고 타월로 감싸 물기를 제거한 뒤 뉘어서 그늘에 건조하세요. (권장 세탁 주기: 4~5회 착용 후)";
            } else if (lower.includes('청바지') || lower.includes('데님')) {
                return "[온도] 30℃ 이하의 찬물 (단독 세탁 권장)\n[세제] 중성세제 (표백제 절대 금지)\n[특징 및 팁] 청바지는 뒤집어서 10회 착용 후 세탁하는 것이 변형과 탈색을 막습니다.";
            } else if (category === '신발') {
                return "[온도] 미지근한 물\n[세제] 중성세제와 부드러운 솔\n[특징 및 팁] 깔창을 분리하여 그늘진 곳에 건조하고 직사광선을 피하세요. (권장 세탁 주기: 오염 발생 시)";
            } else if (category === '하의') {
                return "[온도] 30℃ 이하 표준 물세탁\n[세제] 일반 세제 또는 중성세제\n[특징 및 팁] 주머니 속 이물질을 비우고 지퍼를 채운 뒤 뒤집어 세탁하세요. (권장 세탁 주기: 3~4회 착용 후)";
            } else {
                return "[온도] 30~40℃ 이하의 물 사용\n[세제] 일반 세탁세제 또는 산소표백제\n[특징 및 팁] 색상별로 분리하여 표준 코스로 세탁합니다. (권장 세탁 주기: 매번 착용 후)";
            }
        }

        async function analyzeAndValidateClothing(rawName, manualCat, imageBase64) {
            let category = manualCat;
            let itemName = rawName ? rawName.trim() : "";
            let image = imageBase64;

            if (ClosetState.apiKey && imageBase64) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ClosetState.apiKey}`;
                    let contents = [{
                        role: "user", parts: [{
                            text: `너는 10년 차 패션 전문가야. 제공된 이미지를 분석해.
                    1. 카테고리는 반드시 ['상의', '하의', '아우터', '원피스', '신발'] 중 하나로 분류해.
                    2. 옷 이름(name)을 정밀하게 분석해 적어.
                    순수 JSON으로만 응답해:
                    { "valid": true, "category": "...", "name": "..." }` }]
                    }];

                    const base64Data = imageBase64.split(',')[1];
                    const mimeType = imageBase64.split(';')[0].split(':')[1];
                    contents[0].parts.unshift({ inline_data: { mime_type: mimeType, data: base64Data } });

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: contents })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const text = data.candidates[0].content.parts[0].text;
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (!category) category = parsed.category || "상의";
                            if (!itemName) itemName = parsed.name || "스마트 분석 의류";
                        }
                    }
                } catch (e) {
                    console.warn("API fallback triggered.");
                }
            }

            if (!category) {
                const lower = itemName.toLowerCase();
                if (lower.includes('바지') || lower.includes('팬츠') || lower.includes('청바지') || lower.includes('슬랙스') || lower.includes('스커트') || lower.includes('치마')) {
                    category = "하의";
                } else if (lower.includes('자켓') || lower.includes('코트') || lower.includes('패딩') || lower.includes('점퍼') || lower.includes('가디건') || lower.includes('조끼')) {
                    category = "아우터";
                } else if (lower.includes('신발') || lower.includes('운동화') || lower.includes('스니커즈') || lower.includes('구두') || lower.includes('부츠')) {
                    category = "신발";
                } else if (lower.includes('원피스') || lower.includes('드레스') || lower.includes('정장')) {
                    category = "원피스";
                } else {
                    category = "상의";
                }
            }

            if (!itemName) {
                itemName = image ? "스마트 업로드 패션" : "데일리 베이직 아이템";
            }

            return {
                valid: true,
                category: category,
                name: itemName,
                laundryGuide: getDetailedLaundryGuide(category, itemName)
            };
        }
    return { isValidWeather, getDetailedLaundryGuide, analyzeAndValidateClothing };
})();
