/* Page-only, local demos. Bootstrap owns modal/offcanvas focus, Escape, and restoration. */
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    const status = (id, text) => { $(id).textContent = text; };
    const filter = (input, container, output) => {
        if (!$(input)) return;
        const items = [...$(container).querySelectorAll('a')];
        const update = () => {
            const query = $(input).value.trim().toLowerCase();
            const focused = document.activeElement;
            items.forEach(item => { item.hidden = !item.textContent.toLowerCase().includes(query); });
            if (items.some(item => item === focused && item.hidden)) $(input).focus();
            const count = items.filter(item => !item.hidden).length;
            status(output, `${count} results${query ? ` for “${query}”` : ''}.${count ? '' : ' Try a different name or clear the search.'}`);
        };
        $(input).addEventListener('input', update);
        update();
    };
    filter('commandSearch', 'commandResults', 'commandStatus');

    if ($('framework')) {
        // An editable list autocomplete; active descendant stays inside the input's listbox.
        const combo = $('framework');
        const options = [...$('frameworkOptions').children];
        let active = -1;
        const closeCombo = () => {
            $('frameworkOptions').hidden = true;
            combo.setAttribute('aria-expanded', 'false');
            combo.removeAttribute('aria-activedescendant');
            active = -1;
        };
        const showCombo = () => {
            options.forEach(option => {
                option.hidden = !option.textContent.toLowerCase().includes(combo.value.toLowerCase());
                option.setAttribute('aria-selected', 'false');
            });
            active = -1;
            combo.removeAttribute('aria-activedescendant');
            $('frameworkOptions').hidden = false;
            combo.setAttribute('aria-expanded', 'true');
            status('comboStatus', `${options.filter(option => !option.hidden).length} frameworks available.`);
        };
        const pickOption = option => {
            combo.value = option.textContent;
            closeCombo();
            status('comboStatus', `${combo.value} selected.`);
        };
        combo.addEventListener('input', showCombo);
        combo.addEventListener('focus', showCombo);
        combo.addEventListener('keydown', event => {
            const visible = options.filter(option => !option.hidden);
            if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
                event.preventDefault();
                if ($('frameworkOptions').hidden) showCombo();
                if (!visible.length) return;
                active = active < 0 ? (event.key === 'ArrowDown' ? 0 : visible.length - 1) : (active + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length;
                options.forEach(option => option.setAttribute('aria-selected', String(option === visible[active])));
                combo.setAttribute('aria-activedescendant', visible[active].id);
            } else if (event.key === 'Enter' && active >= 0) {
                event.preventDefault();
                pickOption(visible[active]);
            } else if (event.key === 'Escape' || event.key === 'Tab') closeCombo();
        });
        options.forEach(option => option.addEventListener('pointerdown', event => {
            event.preventDefault();
            pickOption(option);
        }));
        combo.addEventListener('blur', closeCombo);

    }

    if ($('otp')) {
        $('otp').addEventListener('input', () => {
            $('otp').value = $('otp').value.replace(/[^0-9]/g, '').slice(0, 6);
            $('otp').removeAttribute('aria-invalid');
            status('otpStatus', '');
        });
    }

    for (const [form, input, output, text] of [
        ['otpForm', 'otp', 'otpStatus', 'Code verified locally. No authentication performed.'],
        ['fieldForm', 'contactEmail', 'fieldStatus', 'Contact validated locally. Nothing sent.']
    ]) {
        if (!$(form)) continue;
        $(form).addEventListener('submit', event => {
            event.preventDefault();
            status(output, text);
            $(input).removeAttribute('aria-invalid');
        });
        $(input).addEventListener('invalid', () => {
            $(input).setAttribute('aria-invalid', 'true');
            status(output, $(input).validationMessage);
        });
        $(input).addEventListener('input', () => $(input).removeAttribute('aria-invalid'));
    }
    $('volume')?.addEventListener('input', () => { $('volumeOutput').value = $('volume').value; });
    $('countUp')?.addEventListener('click', () => { $('countValue').value = Number($('countValue').value) + 1; });
    $('countDown')?.addEventListener('click', () => { $('countValue').value = Math.max(0, Number($('countValue').value) - 1); });

    if ($('calendarDays')) {
        // Calendar: one tab stop, civil-date arithmetic (no UTC date conversion).
        let calendarDate = new Date();
        let selectedDate = null;
        const dateLabel = date => date.toLocaleDateString('en', { dateStyle: 'full' });
        const drawCalendar = (focus = false) => {
            const year = calendarDate.getFullYear();
            const month = calendarDate.getMonth();
            status('calendarMonth', calendarDate.toLocaleDateString('en', { month: 'long', year: 'numeric' }));
            $('calendarDays').replaceChildren();
            for (let i = 0; i < new Date(year, month, 1).getDay(); i++) $('calendarDays').append(document.createElement('span'));
            for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
                const date = new Date(year, month, day);
                const button = document.createElement('button');
                button.className = 'btn btn-light';
                button.textContent = day;
                button.tabIndex = day === calendarDate.getDate() ? 0 : -1;
                button.dataset.day = day;
                button.setAttribute('aria-label', dateLabel(date));
                const selected = selectedDate?.toDateString() === date.toDateString();
                button.setAttribute('aria-pressed', String(selected));
                if (selected) button.className = 'btn btn-primary';
                if (date.toDateString() === new Date().toDateString()) button.setAttribute('aria-current', 'date');
                button.addEventListener('click', () => {
                    calendarDate = date;
                    selectedDate = date;
                    status('calendarStatus', `Selected ${dateLabel(date)}.`);
                    drawCalendar(true);
                });
                $('calendarDays').append(button);
            }
            if (focus) $('calendarDays').querySelector('[tabindex="0"]').focus();
        };
        const changeMonth = delta => {
            const day = calendarDate.getDate();
            calendarDate.setDate(1);
            calendarDate.setMonth(calendarDate.getMonth() + delta);
            calendarDate.setDate(Math.min(day, new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()));
        };
        $('monthPrevious').addEventListener('click', () => { changeMonth(-1); drawCalendar(); });
        $('monthNext').addEventListener('click', () => { changeMonth(1); drawCalendar(); });
        $('calendarDays').addEventListener('keydown', event => {
            const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -calendarDate.getDay(), End: 6 - calendarDate.getDay() };
            if (Object.hasOwn(deltas, event.key)) calendarDate.setDate(calendarDate.getDate() + deltas[event.key]);
            else if (event.key === 'PageUp' || event.key === 'PageDown') changeMonth(event.key === 'PageUp' ? -1 : 1);
            else return;
            event.preventDefault();
            drawCalendar(true);
        });
        drawCalendar();

    }

    if ($('commandDialog')) {
        const commandDialog = bootstrap.Modal.getOrCreateInstance($('commandDialog'));
        document.addEventListener('keydown', event => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !document.querySelector('.offcanvas.show, .modal.show:not(#commandDialog)')) {
                event.preventDefault();
                if ($('commandDialog').classList.contains('show')) commandDialog.hide();
                else commandDialog.show();
            }
        });
        let commandReturnFocus;
        $('commandDialog').addEventListener('show.bs.modal', () => { commandReturnFocus = document.activeElement; });
        $('commandDialog').addEventListener('shown.bs.modal', () => $('commandSearch').focus());
        $('commandDialog').addEventListener('hidden.bs.modal', () => commandReturnFocus?.focus());
        $('commandDialog').addEventListener('keydown', event => {
            const links = [...$('commandResults').querySelectorAll('a')].filter(link => !link.hidden);
            const index = links.indexOf(document.activeElement);
            if (['ArrowDown', 'ArrowUp'].includes(event.key) && links.length) {
                event.preventDefault();
                const next = index < 0 ? (event.key === 'ArrowDown' ? 0 : links.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
                links[next].focus();
            } else if (event.key === 'Enter' && event.target === $('commandSearch') && links.length) {
                event.preventDefault(); links[0].click();
            }
        });
    }

    if ($('archiveDialog')) {
        $('archiveDialog').addEventListener('shown.bs.modal', () => {
            // Bootstrap sets role=dialog; restore the more specific alertdialog role.
            $('archiveDialog').setAttribute('role', 'alertdialog');
            $('archiveCancel').focus();
        });
        $('archiveConfirm').addEventListener('click', () => status('archiveStatus', 'Sample project archived locally. Reload to reset.'));
    }

    if ($('demoDrawer')) {
        $('saveGoal').addEventListener('click', () => {
            if (!$('dailyGoal').reportValidity()) return;
            status('goalStatus', `Goal: ${$('dailyGoal').value} tasks.`);
            bootstrap.Offcanvas.getInstance($('demoDrawer')).hide();
        });
        $('demoDrawer').addEventListener('shown.bs.offcanvas', () => $('dailyGoal').focus());
    }

    if ($('demoSheet')) {
        $('demoSheet').addEventListener('shown.bs.offcanvas', () => $('profileName').focus());
        $('profileForm').addEventListener('submit', event => {
            event.preventDefault();
            status('profileStatus', `Profile: ${$('profileName').value}.`);
            bootstrap.Offcanvas.getInstance($('demoSheet')).hide();
        });
    }

    if ($('personCard')) {
        const hover = document.querySelector('.hover-card');
        hover.addEventListener('keydown', event => { if (event.key === 'Escape') hover.classList.add('dismissed'); });
        hover.addEventListener('mouseleave', () => hover.classList.remove('dismissed'));
        hover.addEventListener('focusin', () => hover.classList.remove('dismissed'));

    }

    if ($('contextPopup')) {
        const context = $('contextPopup');
        $('contextTarget').setAttribute('aria-haspopup', 'menu');
        $('contextTarget').setAttribute('aria-controls', 'contextPopup');
        $('contextTarget').setAttribute('aria-expanded', 'false');
        context.addEventListener('toggle', event => $('contextTarget').setAttribute('aria-expanded', String(event.newState === 'open')));
        const contextItems = [...context.querySelectorAll('button:not(:disabled)')];
        const closeContext = () => {
            if (context.matches(':popover-open')) context.hidePopover();
            $('contextTarget').focus();
        };
        const openContext = event => {
            event.preventDefault();
            if (!context.matches(':popover-open')) context.showPopover();
            const bounds = $('contextTarget').getBoundingClientRect();
            context.style.margin = '0';
            context.style.inset = 'auto';
            const x = event.type === 'contextmenu' ? event.clientX : bounds.left;
            const y = event.type === 'contextmenu' ? event.clientY : bounds.bottom;
            context.style.left = `${Math.max(8, Math.min(x, innerWidth - context.offsetWidth - 8))}px`;
            context.style.top = `${Math.max(8, Math.min(y, innerHeight - context.offsetHeight - 8))}px`;
            contextItems[0].focus();
        };
        $('contextTarget').addEventListener('contextmenu', openContext);
        $('contextTarget').addEventListener('click', openContext);
        $('contextTarget').addEventListener('keydown', event => {
            if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) openContext(event);
        });
        context.addEventListener('keydown', event => {
            if (event.key === 'Escape' || event.key === 'Tab') {
                event.preventDefault(); closeContext();
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                const index = contextItems.indexOf(document.activeElement);
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? contextItems.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + contextItems.length) % contextItems.length;
                contextItems[next].focus();
            }
        });
        contextItems.forEach(button => button.addEventListener('click', () => {
            status('contextStatus', `${button.dataset.context} (demo).`);
            closeContext();
        }));
        document.addEventListener('pointerdown', event => {
            if (context.matches(':popover-open') && !context.contains(event.target) && event.target !== $('contextTarget')) context.hidePopover();
        });
    }

    if ($('menubar')) {
        const menus = [...document.querySelectorAll('[role="menubar"] > .dropdown > button')];
        document.querySelector('[role="menubar"]').addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const current = event.target.closest('.dropdown');
            const index = menus.findIndex(button => button.parentElement === current);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? menus.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length;
            menus.forEach(button => { bootstrap.Dropdown.getOrCreateInstance(button).hide(); button.tabIndex = -1; });
            menus[next].tabIndex = 0;
            menus[next].focus();
        });
        document.querySelectorAll('[data-menu-action]').forEach(button => button.addEventListener('click', () => status('menuStatus', `${button.dataset.menuAction} (local demo).`)));

    }

    $('directionSelect')?.addEventListener('change', () => { $('directionSample').dir = $('directionSelect').value; });
    if ($('resizeHandle')) {
        const handle = $('resizeHandle');
        const resize = value => {
            const percent = Math.max(20, Math.min(80, Math.round(value)));
            $('resizePanels').style.setProperty('--panel-width', `${percent}%`);
            handle.setAttribute('aria-valuenow', percent);
        };
        handle.addEventListener('keydown', event => {
            const value = Number(handle.getAttribute('aria-valuenow'));
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            resize(event.key === 'Home' ? 20 : event.key === 'End' ? 80 : value + (event.key === 'ArrowLeft' ? -5 : 5));
        });
        handle.addEventListener('pointerdown', event => { handle.setPointerCapture(event.pointerId); handle.focus(); });
        handle.addEventListener('pointermove', event => {
            if (!handle.hasPointerCapture(event.pointerId)) return;
            const rect = $('resizePanels').getBoundingClientRect();
            resize((event.clientX - rect.left) / rect.width * 100);
        });
    }

    $('createProject')?.addEventListener('click', () => {
        status('emptyContent', 'Naha workspace · sample project created.');
        status('emptyStatus', '1 sample project added. Reload to reset.');
        $('createProject').disabled = true;
    });
    $('loadPreview')?.addEventListener('click', () => {
        $('loadPreview').disabled = true;
        $('loadingPreview').setAttribute('aria-busy', 'true');
        status('loadingStatus', 'Loading sample profile…');
        setTimeout(() => {
            status('loadingPreview', 'Ujang Kasep · Workspace administrator');
            $('loadingPreview').setAttribute('aria-busy', 'false');
            status('loadingStatus', 'Sample profile loaded.');
            $('loadPreview').disabled = false;
        }, 650);
    });
    $('copyCode')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText($('codeSample').textContent);
            status('copyStatus', 'Code copied.');
        } catch {
            const selection = getSelection();
            const range = document.createRange();
            range.selectNodeContents($('codeSample'));
            selection.removeAllRanges(); selection.addRange(range);
            status('copyStatus', 'Clipboard unavailable. Code selected; press Ctrl/Cmd+C to copy.');
        }
    });

    if ($('attachmentInput')) {
        let attachmentUrl;
        const clearAttachment = () => {
            if (attachmentUrl) URL.revokeObjectURL(attachmentUrl);
            attachmentUrl = undefined;
            $('attachmentList').replaceChildren();
        };
        $('attachmentInput').addEventListener('change', () => {
            clearAttachment();
            const file = $('attachmentInput').files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024 || !/\.(png|jpe?g|pdf|txt)$/i.test(file.name) || (file.type && !['image/png', 'image/jpeg', 'application/pdf', 'text/plain'].includes(file.type))) {
                status('attachmentStatus', 'Unsupported file. Choose PNG, JPEG, PDF, or text up to 5 MB.');
                $('attachmentInput').value = '';
                return;
            }
            const row = document.createElement('div'); row.className = 'nd-item mb-2';
            const info = document.createElement('div'); info.className = 'flex-grow-1';
            const name = document.createElement('strong'); name.textContent = file.name;
            const description = document.createElement('p'); description.className = 'small text-muted mb-0';
            description.textContent = `${Math.ceil(file.size / 1024)} KB · Local preview ready`;
            info.append(name, description);
            const remove = document.createElement('button'); remove.className = 'btn btn-light btn-sm'; remove.textContent = 'Remove';
            remove.setAttribute('aria-label', `Remove ${file.name}`);
            remove.addEventListener('click', () => {
                clearAttachment(); $('attachmentInput').value = '';
                status('attachmentStatus', 'Attachment removed.'); $('attachmentInput').focus();
            });
            row.append(info, remove); $('attachmentList').append(row);
            if (['image/png', 'image/jpeg'].includes(file.type)) {
                attachmentUrl = URL.createObjectURL(file);
                const image = document.createElement('img'); image.src = attachmentUrl; image.alt = `Preview of ${file.name}`;
                image.addEventListener('error', () => status('attachmentStatus', 'Image could not be decoded. Remove it and choose another file.'));
                $('attachmentList').append(image);
            }
            status('attachmentStatus', 'File stays in your browser. No upload performed.');
        });
        window.addEventListener('pagehide', clearAttachment);
    }

    $('runTrace')?.addEventListener('click', () => {
        $('runTrace').disabled = true;
        status('traceState', 'Running: check component examples');
        status('traceStatus', 'Sample check running…');
        setTimeout(() => {
            status('traceState', 'Completed: check component examples');
            status('traceOutput', 'Demo result: 3 examples checked. 0 simulated failures.');
            status('traceStatus', 'Sample check complete. This is simulated output.');
            $('runTrace').disabled = false;
        }, 800);
    });

    if ($('message-scroller')) {
        const viewport = $('message-scroller');
        const atBottom = () => viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 24;
        const jumpState = () => { $('jumpLatest').hidden = atBottom(); };
        const appendMessage = (name, text, outgoing = false, prepend = false) => {
            const article = document.createElement('article');
            article.className = `message-row${outgoing ? ' message-outgoing' : ''}`;
            const avatar = document.createElement('span'); avatar.className = 'nd-avatar'; avatar.setAttribute('aria-hidden', 'true'); avatar.textContent = outgoing ? 'UK' : 'NA';
            const content = document.createElement('div');
            const author = document.createElement('strong'); author.textContent = name;
            const bubble = document.createElement('div'); bubble.className = 'nd-bubble'; bubble.textContent = text;
            content.append(author, bubble); article.append(avatar, content);
            if (prepend) $('messageLog').prepend(article); else $('messageLog').append(article);
            return article;
        };
        viewport.addEventListener('scroll', jumpState);
        $('jumpLatest').addEventListener('click', () => { viewport.scrollTop = viewport.scrollHeight; jumpState(); });
        $('loadHistory').addEventListener('click', () => {
            const top = viewport.scrollTop; const height = viewport.scrollHeight;
            appendMessage('NahaAdmin · Earlier', 'Welcome to the local component preview. Earlier messages preserve your reading position.', false, true);
            viewport.scrollTop = top + viewport.scrollHeight - height;
            $('loadHistory').disabled = true;
            status('messageStatus', 'Earlier sample message loaded.');
            jumpState();
        });
        $('messageForm').addEventListener('submit', event => {
            event.preventDefault();
            const text = $('messageInput').value.trim();
            if (!text) { $('messageInput').setCustomValidity('Enter a message.'); $('messageInput').reportValidity(); return; }
            appendMessage('Ujang', text, true);
            $('messageInput').value = '';
            // Sending is an explicit request to reveal the new turn; incoming replies never steal a reader's place.
            viewport.scrollTop = viewport.scrollHeight;
            jumpState();
            setTimeout(() => {
                const follow = atBottom() && !viewport.contains(document.activeElement) && !getSelection()?.toString();
                appendMessage('NahaAdmin', 'Local demo reply: your message is visible here. No server or AI service was contacted.');
                if (follow) viewport.scrollTop = viewport.scrollHeight;
                jumpState();
            }, 500);
        });
        $('messageInput').addEventListener('input', () => $('messageInput').setCustomValidity(''));
        $('reaction').addEventListener('click', () => {
            const pressed = $('reaction').getAttribute('aria-pressed') !== 'true';
            $('reaction').setAttribute('aria-pressed', String(pressed));
            $('reaction').textContent = `Helpful · ${pressed ? 1 : 0}`;
        });
        jumpState();

    }

    if ($('questionForm')) {
        const questions = [...document.querySelectorAll('[data-question]')];
        let step = 0;
        const showQuestion = (focus = true) => {
            questions.forEach((question, index) => {
                question.hidden = index !== step;
                question.disabled = index !== step;
            });
            $('questionPrevious').disabled = step === 0;
            $('questionSkip').hidden = step !== 1;
            $('questionNext').textContent = step === questions.length - 1 ? 'Save plan' : 'Next';
            $('questionProgress').value = step + 1;
            status('questionStatus', `Question ${step + 1} of ${questions.length}.`);
            if (focus) questions[step].focus();
        };
        $('questionForm').addEventListener('submit', event => {
            event.preventDefault();
            if (step < questions.length - 1) { step++; showQuestion(); return; }
            questions.forEach(question => { question.disabled = false; });
            const data = new FormData($('questionForm'));
            questions.forEach((question, index) => { question.disabled = index !== step; });
            status('questionStatus', `Saved locally: ${data.get('projectName')} · ${data.get('projectType')} · ${data.getAll('details').join(', ') || 'No optional details'}.`);
        });
        $('questionPrevious').addEventListener('click', () => { step--; showQuestion(); });
        $('questionSkip').addEventListener('click', () => {
            questions[step].querySelectorAll('input').forEach(input => { input.checked = false; });
            step++; showQuestion();
        });
        $('questionForm').addEventListener('reset', () => { step = 0; showQuestion(); });
        questions.forEach(question => question.addEventListener('invalid', event => {
            event.target.setAttribute('aria-invalid', 'true');
            status('questionStatus', event.target.validationMessage);
        }, true));
        $('questionForm').addEventListener('input', event => event.target.removeAttribute('aria-invalid'));
        showQuestion(false);    }


})();