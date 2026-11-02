(() => {
document.getElementById('item-image-file').addEventListener('change', (e) => {
            const display = document.getElementById('file-name-display');
            if (e.target.files && e.target.files.length > 0) {
                display.innerText = e.target.files[0].name;
                display.classList.add('text-indigo-600');
            } else {
                display.innerText = '선택된 파일 없음';
                display.classList.remove('text-indigo-600');
            }
        });

window.addEventListener('DOMContentLoaded', () => {
            if (ClosetState.currentUser) {
                ClosetView.showMainScreen();
            } else {
                ClosetView.showAuthScreen();
            }

            document.getElementById('nickname-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('nickname-input');
                const keyInput = document.getElementById('api-key-input');
                if (input.value.trim()) {
                    ClosetState.currentUser = input.value.trim();
                    ClosetState.apiKey = keyInput.value.trim();
                    localStorage.setItem('closet_nickname', ClosetState.currentUser);
                    if (ClosetState.apiKey) localStorage.setItem('closet_api_key', ClosetState.apiKey);
                    ClosetView.showMainScreen();
                    ClosetUI.showMessage(`반갑습니다, ${ClosetState.currentUser}님! 스마트 옷장이 열렸습니다.`, 'success');
                }
            });

            document.getElementById('btn-logout').addEventListener('click', () => {
                ClosetUI.showConfirm('옷장을 닫으시겠습니까?', '데이터는 기기에 안전하게 보관됩니다.', () => {
                    localStorage.removeItem('closet_nickname');
                    localStorage.removeItem('closet_api_key');
                    ClosetState.currentUser = null;
                    ClosetState.apiKey = null;
                    ClosetView.showAuthScreen();
                });
            });

            document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
                document.getElementById('modal-confirm').classList.add('hidden');
                ClosetState.confirmAction = null;
            });
            document.getElementById('btn-confirm-ok').addEventListener('click', () => {
                document.getElementById('modal-confirm').classList.add('hidden');
                if (ClosetState.confirmAction) ClosetState.confirmAction();
                ClosetState.confirmAction = null;
            });

            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.nav-tab').forEach(t => {
                        t.classList.remove('text-indigo-600');
                        t.classList.add('text-slate-400', 'hover:text-slate-600');
                        t.querySelector('.nav-indicator').classList.remove('bg-indigo-50');
                    });
                    const currentBtn = e.currentTarget;
                    currentBtn.classList.remove('text-slate-400', 'hover:text-slate-600');
                    currentBtn.classList.add('text-indigo-600');
                    currentBtn.querySelector('.nav-indicator').classList.add('bg-indigo-50');

                    const targetId = currentBtn.getAttribute('data-target');
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                    document.getElementById(targetId).classList.remove('hidden');

                    if (targetId === 'view-closet') ClosetView.renderCloset();
                    if (targetId === 'view-rate') ClosetView.renderRateList();
                });
            });

            document.getElementById('btn-add').addEventListener('click', () => document.getElementById('modal-add').classList.remove('hidden'));
            document.getElementById('btn-close-add').addEventListener('click', () => {
                document.getElementById('modal-add').classList.add('hidden');
                document.getElementById('add-item-form').reset();
                document.getElementById('file-name-display').innerText = '선택된 파일 없음';
                document.getElementById('file-name-display').classList.remove('text-indigo-600');
            });
            document.getElementById('btn-close-detail').addEventListener('click', () => document.getElementById('modal-detail').classList.add('hidden'));

            document.getElementById('add-item-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const manualName = document.getElementById('item-name-input').value.trim();
                const manualCategory = document.getElementById('item-category-select').value;
                const imageFileInput = document.getElementById('item-image-file');
                const hasImage = imageFileInput.files && imageFileInput.files[0];

                if (!manualName && !manualCategory && !hasImage) {
                    return ClosetUI.showMessage("의류 이름, 카테고리 또는 사진 중 하나 이상을 입력해주세요.", 'error');
                }

                const submitBtn = document.getElementById('btn-submit-add');
                const originalHtml = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> 의류 등록 및 분석 중...';
                submitBtn.disabled = true;

                try {
                    let imageBase64 = null;
                    if (hasImage) {
                        const file = imageFileInput.files[0];
                        imageBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.readAsDataURL(file);
                        });
                    }

                    const analysis = await ClosetServices.analyzeAndValidateClothing(manualName, manualCategory, imageBase64);

                    const newItem = {
                        id: Date.now().toString(),
                        name: analysis.name,
                        category: analysis.category,
                        image: imageBase64,
                        laundryGuide: analysis.laundryGuide,
                        isFavorite: false
                    };

                    ClosetState.clothingItems.unshift(newItem);
                    localStorage.setItem('closet_items', JSON.stringify(ClosetState.clothingItems));

                    ClosetUI.showMessage(`[${analysis.category}] ${analysis.name} 등록 완료!`, 'success');
                    ClosetView.renderCloset();
                    document.getElementById('btn-close-add').click();
                } catch (error) {
                    ClosetUI.showMessage('등록 중 오류가 발생했습니다.', 'error');
                } finally {
                    submitBtn.innerHTML = originalHtml;
                    submitBtn.disabled = false;
                }
            });

            document.getElementById('btn-get-rate').addEventListener('click', () => {
                const checkedRadios = document.querySelectorAll('.rate-item-radio:checked');
                let selectedClothesMap = {};
                let hasTop = false;
                let hasBottom = false;

                checkedRadios.forEach(radio => {
                    const cat = radio.getAttribute('data-category');
                    const itemName = radio.value;
                    if (itemName && itemName.trim() !== '') {
                        selectedClothesMap[cat] = itemName;
                        if (cat === '상의' || cat === '원피스') hasTop = true;
                        if (cat === '하의') hasBottom = true;
                    }
                });

                if (!hasTop || !hasBottom) {
                    return ClosetUI.showMessage("상의와 하의를 모두 1개씩 선택해야 평가가 가능합니다!", "error");
                }

                try {
                    const ratingHtml = ClosetRecommendations.generateFixedRateResult(selectedClothesMap);
                    document.getElementById('rate-result').innerHTML = ratingHtml;
                    document.getElementById('rate-result-container').classList.remove('hidden');

                    document.getElementById('btn-share-coord').onclick = () => {
                        const clothesTextList = Object.entries(selectedClothesMap).map(([c, n]) => `[${c}] ${n}`).join('\n');
                        const shareText = `🖤 나의 느좋 패션 테스트 결과 🖤\n\n[선택한 아이템]\n${clothesTextList}\n\n✨ 완벽한 핏과 톤온톤으로 AI 분석을 통과한 오늘의 코디!`;

                        const textArea = document.createElement("textarea");
                        textArea.value = shareText;
                        textArea.style.position = "fixed";
                        textArea.style.top = "0";
                        textArea.style.left = "0";
                        textArea.style.opacity = "0";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();

                        try {
                            const successful = document.execCommand('copy');
                            if (successful) ClosetUI.showMessage('내 코디 결과가 복사되었습니다! SNS에 자랑해보세요.', 'success');
                            else ClosetUI.showMessage('복사에 실패했습니다.', 'error');
                        } catch (err) {
                            ClosetUI.showMessage('브라우저 복사 기능을 지원하지 않습니다.', 'error');
                        }
                        document.body.removeChild(textArea);
                    };
                } catch (e) {
                    ClosetUI.showMessage("분석 중 오류가 발생했습니다.", "error");
                }
            });

            document.getElementById('btn-get-rec').addEventListener('click', () => {
                const weather = document.getElementById('rec-weather').value.trim();
                const occasion = document.getElementById('rec-occasion').value.trim();

                if (!weather || !occasion) {
                    return ClosetUI.showMessage('날씨와 약속을 모두 입력해주세요!', 'error');
                }

                if (!ClosetServices.isValidWeather(weather)) {
                    return ClosetUI.showMessage('유효하지 않은 날씨입니다. (예: 맑음, 비, 폭염, 쌀쌀 등)', 'error');
                }

                if (ClosetState.clothingItems.length < 2) {
                    return ClosetUI.showMessage('다양한 맞춤 추천을 위해 옷장에 옷을 2개 이상 등록해주세요.', 'error');
                }

                try {
                    const recHtml = ClosetRecommendations.generateDynamicRecResult({ weather, occasion, closet: ClosetState.clothingItems });
                    document.getElementById('rec-result').innerHTML = recHtml;
                    document.getElementById('rec-result-container').classList.remove('hidden');
                } catch (e) {
                    ClosetUI.showMessage("추천 중 오류가 발생했습니다.", "error");
                }
            });
        });
})();
