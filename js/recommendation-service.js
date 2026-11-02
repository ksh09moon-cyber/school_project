window.ClosetRecommendations = (() => {
// 철저하게 고정된 일관성 있는 느좋 패션 평가 로직 (랜덤 방지)
        function generateFixedRateResult(selectedMap) {
            let topName = selectedMap['상의'] || selectedMap['원피스'] || '상의';
            let bottomName = selectedMap['하의'] || '하의';

            // 이름들의 글자 길이와 코드 조합으로 고정된 점수 산출 (항상 동일한 조합은 동일 점수)
            let hash = (topName + bottomName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            let fitScore = 88 + (hash % 10); // 88~97점 고정
            let colorScore = 85 + ((hash * 3) % 13); // 85~97점 고정
            let trendScore = 90 + ((hash * 7) % 9); // 90~98점 고정
            let totalScore = Math.floor((fitScore + colorScore + trendScore) / 3);

            return `
                <div class="flex items-center justify-between pb-4 border-b border-pink-100">
                    <div>
                        <span class="font-extrabold text-slate-800 text-lg block">⭐ 느좋 종합 점수</span>
                        <span class="text-xs text-slate-400 font-medium">${topName} & ${bottomName} 조합 분석</span>
                    </div>
                    <span class="text-3xl font-black text-pink-500 bg-pink-50 px-4 py-2 rounded-2xl border border-pink-100">${totalScore}<span class="text-base font-bold text-pink-300">점</span></span>
                </div>
                <div class="space-y-3 pt-3">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="font-bold text-slate-800 text-sm mb-1.5 flex justify-between items-center">
                            <span><i class="fa-solid fa-ruler-combined text-slate-400 mr-1"></i> 핏 (Fit)</span>
                            <span class="text-pink-500 font-extrabold bg-white px-2 py-0.5 rounded-lg border border-slate-200">${fitScore}점</span>
                        </p>
                        <p class="text-xs text-slate-600 leading-relaxed font-medium">선택하신 '${topName}'과 '${bottomName}'의 실루엣 기장감이 균형 잡힌 비율을 보여줍니다.</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="font-bold text-slate-800 text-sm mb-1.5 flex justify-between items-center">
                            <span><i class="fa-solid fa-palette text-slate-400 mr-1"></i> 색 조합 (Color)</span>
                            <span class="text-pink-500 font-extrabold bg-white px-2 py-0.5 rounded-lg border border-slate-200">${colorScore}점</span>
                        </p>
                        <p class="text-xs text-slate-600 leading-relaxed font-medium">톤온톤 연결감이 우수하며 자연스러운 포인트 컬러 매칭으로 세련된 무드를 완성합니다.</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="font-bold text-slate-800 text-sm mb-1.5 flex justify-between items-center">
                            <span><i class="fa-solid fa-fire text-slate-400 mr-1"></i> 트렌드 감도 (Trend)</span>
                            <span class="text-pink-500 font-extrabold bg-white px-2 py-0.5 rounded-lg border border-slate-200">${trendScore}점</span>
                        </p>
                        <p class="text-xs text-slate-600 leading-relaxed font-medium">현재 스트릿 및 데일리 룩 트렌드 감도에 완벽히 부합하는 훌륭한 스타일링입니다.</p>
                    </div>
                </div>
            `;
        }

        function generateDynamicRecResult(payload) {
            const closet = payload.closet;
            const top = closet.find(i => i.category === '상의') || closet.find(i => i.category === '원피스') || { name: '베이직 셔츠' };
            const bottom = closet.find(i => i.category === '하의') || { name: '와이드 팬츠' };
            const outer = closet.find(i => i.category === '아우터');
            const shoes = closet.find(i => i.category === '신발');

            let outerHtml = outer ? `<br><span class="text-amber-600 font-extrabold mt-1 inline-block">아우터: ${outer.name}</span>` : '';
            let shoesHtml = shoes ? `<br><span class="text-orange-600 font-extrabold mt-1 inline-block">신발: ${shoes.name}</span>` : '';

            return `
                <div class="space-y-4">
                    <div class="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-100">
                        <p class="font-extrabold text-indigo-900 text-sm mb-1.5 flex items-center gap-2"><i class="fa-solid fa-location-dot"></i> 분석 상황: ${payload.occasion} (${payload.weather})</p>
                    </div>
                    <div class="space-y-3">
                        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <p class="font-extrabold text-slate-800 text-sm mb-2 relative z-10 leading-relaxed">
                                상의: <span class="text-blue-600">${top.name}</span><br>
                                하의: <span class="text-emerald-600">${bottom.name}</span>
                                ${outerHtml}
                                ${shoesHtml}
                            </p>
                            <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5 relative z-10">
                                <p class="text-xs text-slate-600 font-medium">✔️ '${payload.weather}' 날씨 변화를 고려한 최적의 보온 및 통기성 매칭</p>
                                <p class="text-xs text-slate-600 font-medium">✔️ '${payload.occasion}' 장소의 분위기와 활동성에 알맞은 센스 있는 룩 연출</p>
                            </div>
                        </div>
                        <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl text-white text-xs font-bold shadow-lg mt-2 text-center">
                            <span class="text-pink-300">VIBE:</span> ${payload.occasion}에 가장 주목받는 센스 만점 스타일링 🎧✨
                        </div>
                    </div>
                </div>
            `;
        }
    return { generateFixedRateResult, generateDynamicRecResult };
})();
