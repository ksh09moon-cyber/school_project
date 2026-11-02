window.ClosetView = (() => {
function showAuthScreen() {
            document.getElementById('auth-screen').classList.remove('hidden');
            document.getElementById('main-screen').classList.add('hidden');
            document.getElementById('main-screen').classList.remove('flex');
        }

        function showMainScreen() {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('main-screen').classList.remove('hidden');
            document.getElementById('main-screen').classList.add('flex');
            document.getElementById('user-title').innerText = `${ClosetState.currentUser}님의 옷장`;
            renderCloset();
        }

        function getCategoryDetails(category) {
            const map = {
                '상의': { emoji: '👕', label: '상의', color: 'text-sky-600 bg-sky-50', bg: 'bg-sky-100' },
                '하의': { emoji: '👖', label: '하의', color: 'text-blue-600 bg-blue-50', bg: 'bg-blue-100' },
                '아우터': { emoji: '🧥', label: '아우터', color: 'text-amber-600 bg-amber-50', bg: 'bg-amber-100' },
                '원피스': { emoji: '👗', label: '원피스/기타', color: 'text-fuchsia-600 bg-fuchsia-50', bg: 'bg-fuchsia-100' },
                '신발': { emoji: '👟', label: '신발', color: 'text-orange-600 bg-orange-50', bg: 'bg-orange-100' }
            };
            return map[category] || map['상의'];
        }

        function renderCloset() {
            const container = document.getElementById('closet-category-sections');
            document.getElementById('item-count').innerText = ClosetState.clothingItems.length;
            container.innerHTML = '';

            if (ClosetState.clothingItems.length === 0) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-4">
                        <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-6xl shadow-inner">🧦</div>
                        <p class="font-extrabold text-slate-600 text-lg">옷장이 텅 비었어요.</p>
                        <p class="text-xs mt-2 font-medium text-slate-400">+ 버튼을 눌러 내 옷을 등록해보세요!</p>
                    </div>
                `;
                return;
            }

            const categories = ['상의', '하의', '아우터', '원피스', '신발'];

            categories.forEach(cat => {
                const itemsInCat = ClosetState.clothingItems.filter(i => i.category === cat);
                if (itemsInCat.length > 0) {
                    const details = getCategoryDetails(cat);
                    const section = document.createElement('div');
                    section.className = 'space-y-4';

                    section.innerHTML = `
                        <div class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                            <div class="flex items-center gap-2.5">
                                <span class="text-2xl">${details.emoji}</span>
                                <h3 class="font-extrabold text-slate-800 text-lg">${cat}</h3>
                            </div>
                            <span class="text-[11px] font-extrabold ${details.color} px-2.5 py-1 rounded-lg">${itemsInCat.length} Items</span>
                        </div>
                        <div class="grid grid-cols-2 gap-4" id="cat-grid-${cat}"></div>
                    `;
                    container.appendChild(section);

                    const grid = section.querySelector(`#cat-grid-${cat}`);
                    itemsInCat.forEach(item => {
                        const isFav = item.isFavorite;
                        const card = document.createElement('div');
                        card.className = 'bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden relative group cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1';
                        card.onclick = () => showDetail(item.id);

                        let visualHtml = `<div class="absolute inset-0 flex flex-col items-center justify-center drop-shadow-sm transform group-hover:scale-105 transition duration-500 bg-slate-50"><span class="text-[6.5rem] mb-2 leading-none">${details.emoji}</span></div>`;
                        if (item.image) {
                            visualHtml = `<img src="${item.image}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" alt="${item.name}">`;
                        }

                        card.innerHTML = `
                            <div class="w-full pt-[100%] relative border-b border-slate-50 overflow-hidden bg-slate-100">
                                <button class="absolute top-3 right-3 text-2xl z-10 transition transform active:scale-90 hover:scale-110 drop-shadow-lg ${isFav ? 'text-pink-500' : 'text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:text-pink-300'}" 
                                        onclick="event.stopPropagation(); toggleFavorite('${item.id}')">
                                    <i class="fa-solid fa-heart"></i>
                                </button>
                                ${visualHtml}
                            </div>
                            <div class="p-4 bg-white flex flex-col gap-1 flex-1 justify-center relative">
                                <h4 class="font-extrabold text-sm text-slate-800 line-clamp-2 leading-relaxed break-keep">${item.name}</h4>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                }
            });
        }

        window.toggleFavorite = function (id) {
            const item = ClosetState.clothingItems.find(i => i.id === id);
            if (item) {
                item.isFavorite = !item.isFavorite;
                localStorage.setItem('closet_items', JSON.stringify(ClosetState.clothingItems));
                renderCloset();
            }
        }

        window.showDetail = function (id) {
            const item = ClosetState.clothingItems.find(i => i.id === id);
            if (!item) return;
            const details = getCategoryDetails(item.category);

            let visualHtml = `<div class="w-28 h-28 rounded-[1.2rem] flex items-center justify-center text-7xl shadow-inner border-2 border-white ${details.bg}">${details.emoji}</div>`;
            if (item.image) {
                visualHtml = `<div class="w-28 h-28 rounded-[1.2rem] overflow-hidden shadow-inner border-2 border-white bg-slate-100 flex-shrink-0"><img src="${item.image}" class="w-full h-full object-cover"></div>`;
            }

            document.getElementById('detail-content').innerHTML = `
                <div class="flex items-center gap-5 mb-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    ${visualHtml}
                    <div class="flex-1">
                        <span class="text-xs font-extrabold px-3 py-1 rounded-md inline-block mb-2 shadow-sm ${details.color}">${item.category}</span>
                        <h3 class="text-lg font-black text-slate-800 leading-tight break-keep">${item.name}</h3>
                    </div>
                </div>
                
                <div class="bg-blue-50/50 p-5 rounded-3xl border border-blue-100 mb-6 shadow-sm max-h-60 overflow-y-auto hide-scrollbar">
                    <h4 class="font-black text-blue-900 mb-3 flex items-center gap-2 text-sm sticky top-0 bg-blue-50/90 py-2 backdrop-blur-sm">
                        <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm shadow-sm"><i class="fa-solid fa-hands-bubbles"></i></div>
                        전문가 세탁 및 보관 가이드
                    </h4>
                    <div class="text-[13px] text-blue-900/80 font-bold whitespace-pre-wrap leading-loose">${item.laundryGuide || "관리 정보가 없습니다."}</div>
                </div>
                
                <button onclick="deleteItem('${item.id}')" class="w-full bg-white text-red-500 font-bold py-4 rounded-2xl hover:bg-red-50 transition border border-red-100 flex items-center justify-center gap-2 shadow-sm text-base">
                    <i class="fa-solid fa-trash-can"></i> 이 의류 삭제하기
                </button>
            `;
            document.getElementById('modal-detail').classList.remove('hidden');
        }

        window.deleteItem = function (id) {
            ClosetUI.showConfirm("이 의류를 삭제하시겠습니까?", "옷장에서 완전히 제거됩니다.", () => {
                ClosetState.clothingItems = ClosetState.clothingItems.filter(i => i.id !== id);
                localStorage.setItem('closet_items', JSON.stringify(ClosetState.clothingItems));
                document.getElementById('modal-detail').classList.add('hidden');
                ClosetUI.showMessage('의류가 정상적으로 삭제되었습니다.', 'success');
                renderCloset();
            });
        }

        function renderRateList() {
            const container = document.getElementById('rate-item-list');
            container.innerHTML = '';

            if (ClosetState.clothingItems.length === 0) {
                container.innerHTML = `
                    <div class="text-slate-400 text-sm py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm font-medium">
                        <i class="fa-solid fa-shirt text-4xl mb-4 text-slate-200"></i><br>
                        코디 평가를 위해<br>옷장에 옷을 먼저 등록해주세요.
                    </div>`;
                return;
            }

            const categories = ['상의', '하의', '아우터', '원피스', '신발'];

            categories.forEach(cat => {
                const itemsInCat = ClosetState.clothingItems.filter(i => i.category === cat);
                if (itemsInCat.length > 0) {
                    const section = document.createElement('div');
                    section.className = 'space-y-3 mb-6';

                    const details = getCategoryDetails(cat);
                    const isRequired = (cat === '상의' || cat === '하의') ? '<span class="text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-bold ml-1">필수</span>' : '';

                    section.innerHTML = `<h4 class="text-sm font-black text-slate-800 px-1 flex items-center gap-1.5"><span class="text-xl">${details.emoji}</span> ${cat} ${isRequired} <span class="text-[10px] text-slate-400 font-medium ml-auto">(최대 1개)</span></h4>`;

                    const listWrapper = document.createElement('div');
                    listWrapper.className = 'space-y-2.5';

                    const noneLabel = document.createElement('label');
                    noneLabel.className = 'flex items-center gap-3 p-3.5 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition bg-white text-xs text-slate-400 font-bold';
                    noneLabel.innerHTML = `
                        <input type="radio" name="rate-cat-${cat}" class="rate-item-radio text-indigo-600 focus:ring-indigo-500 w-5 h-5" data-category="${cat}" value="" checked>
                        <span>선택 안 함</span>
                    `;
                    listWrapper.appendChild(noneLabel);

                    itemsInCat.forEach(item => {
                        let thumbHtml = `<div class="w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white flex-shrink-0 ${details.bg}">${details.emoji}</div>`;
                        if (item.image) {
                            thumbHtml = `<div class="w-12 h-12 rounded-xl overflow-hidden shadow-inner border border-white flex-shrink-0"><img src="${item.image}" class="w-full h-full object-cover"></div>`;
                        }

                        const label = document.createElement('label');
                        label.className = 'flex items-center gap-3 p-3.5 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-200 transition bg-white shadow-sm font-bold group';
                        label.innerHTML = `
                            <input type="radio" name="rate-cat-${cat}" class="rate-item-radio w-5 h-5 text-indigo-600 focus:ring-indigo-500" data-category="${item.category}" value="${item.name}">
                            ${thumbHtml}
                            <div class="flex flex-col overflow-hidden">
                                <span class="text-[13px] text-slate-700 truncate group-hover:text-indigo-700 transition-colors">${item.name}</span>
                            </div>
                        `;
                        listWrapper.appendChild(label);
                    });

                    section.appendChild(listWrapper);
                    container.appendChild(section);
                }
            });

            document.getElementById('rate-result-container').classList.add('hidden');
            document.getElementById('rate-result').innerHTML = '';
        }
    return { showAuthScreen, showMainScreen, renderCloset, renderRateList };
})();
