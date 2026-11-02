window.ClosetUI = (() => {
function showMessage(msg, type = 'info') {
            const toast = document.createElement('div');
            let bgClass = 'bg-slate-900 border-slate-800';
            let iconHtml = '<i class="fa-solid fa-bell text-slate-300"></i>';
            if (type === 'error') { bgClass = 'bg-red-500 border-red-600'; iconHtml = '<i class="fa-solid fa-circle-exclamation text-red-100"></i>'; }
            if (type === 'success') { bgClass = 'bg-emerald-500 border-emerald-600'; iconHtml = '<i class="fa-solid fa-circle-check text-emerald-100"></i>'; }

            toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 px-5 py-3.5 rounded-2xl text-white text-sm font-bold shadow-xl border z-[100] transition-all duration-300 opacity-0 translate-y-4 flex items-center gap-3 whitespace-nowrap ${bgClass}`;
            toast.innerHTML = `${iconHtml} <span>${msg}</span>`;

            document.body.appendChild(toast);
            requestAnimationFrame(() => toast.classList.remove('opacity-0', 'translate-y-4'));
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-4');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function showConfirm(title, desc, callback) {
            document.getElementById('confirm-title').innerText = title;
            document.getElementById('confirm-desc').innerText = desc;
            ClosetState.confirmAction = callback;
            document.getElementById('modal-confirm').classList.remove('hidden');
        }
    return { showMessage, showConfirm };
})();
