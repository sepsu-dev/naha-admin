/* Page behavior only. Load after vendors and naha-admin.min.js where used. */
(() => {

    // Components
    if (document.documentElement.matches('[data-page~="components"]')) {
        /* Page-only, local demos. Bootstrap owns modal/offcanvas focus, Escape, and restoration. */
        (() => {
            'use strict';

            const $ = id => document.getElementById(id);
            const status = (id, text) => {
                $(id).textContent = text;
            };
            const filter = (input, container, output) => {
                if (!$(input)) return;
                const items = [...$(container).querySelectorAll('a')];
                const update = () => {
                    const query = $(input).value.trim().toLowerCase();
                    const focused = document.activeElement;
                    items.forEach(item => {
                        item.hidden = !item.textContent.toLowerCase().includes(query);
                    });
                    if (items.some(item => item === focused && item.hidden)) $(input).focus();
                    const count = items.filter(item => !item.hidden).length;
                    status(
                        output,
                        `${count} results${query ? ` for “${query}”` : ''}.${count ? '' : ' Try a different name or clear the search.'}`
                    );
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
                        active = active < 0
                            ? (event.key === 'ArrowDown' ? 0 : visible.length - 1)
                            : (active + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length;
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

            $('volume')?.addEventListener('input', () => {
                $('volumeOutput').value = $('volume').value;
            });
            $('countUp')?.addEventListener('click', () => {
                $('countValue').value = Number($('countValue').value) + 1;
            });
            $('countDown')?.addEventListener('click', () => {
                $('countValue').value = Math.max(0, Number($('countValue').value) - 1);
            });

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
                    for (let i = 0; i < new Date(year, month, 1).getDay(); i++)
                        $('calendarDays').append(document.createElement('span'));
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
                    calendarDate.setDate(
                        Math.min(day, new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate())
                    );
                };
                $('monthPrevious').addEventListener('click', () => {
                    changeMonth(-1);
                    drawCalendar();
                });
                $('monthNext').addEventListener('click', () => {
                    changeMonth(1);
                    drawCalendar();
                });
                $('calendarDays').addEventListener('keydown', event => {
                    const deltas = {
                        ArrowLeft: -1,
                        ArrowRight: 1,
                        ArrowUp: -7,
                        ArrowDown: 7,
                        Home: -calendarDate.getDay(),
                        End: 6 - calendarDate.getDay()
                    };
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
                    if (
                        (event.ctrlKey || event.metaKey) &&
                        event.key.toLowerCase() === 'k' &&
                        !document.querySelector('.offcanvas.show, .modal.show:not(#commandDialog)')
                    ) {
                        event.preventDefault();
                        if ($('commandDialog').classList.contains('show')) commandDialog.hide();
                        else commandDialog.show();
                    }
                });
                let commandReturnFocus;
                $('commandDialog').addEventListener('show.bs.modal', () => {
                    commandReturnFocus = document.activeElement;
                });
                $('commandDialog').addEventListener('shown.bs.modal', () => $('commandSearch').focus());
                $('commandDialog').addEventListener('hidden.bs.modal', () => commandReturnFocus?.focus());
                $('commandDialog').addEventListener('keydown', event => {
                    const links = [...$('commandResults').querySelectorAll('a')].filter(link => !link.hidden);
                    const index = links.indexOf(document.activeElement);
                    if (['ArrowDown', 'ArrowUp'].includes(event.key) && links.length) {
                        event.preventDefault();
                        const next = index < 0
                            ? (event.key === 'ArrowDown' ? 0 : links.length - 1)
                            : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
                        links[next].focus();
                    } else if (event.key === 'Enter' && event.target === $('commandSearch') && links.length) {
                        event.preventDefault();
                        links[0].click();
                    }
                });
            }

            if ($('archiveDialog')) {
                $('archiveDialog').addEventListener('shown.bs.modal', () => {
                    // Bootstrap sets role=dialog; restore the more specific alertdialog role.
                    $('archiveDialog').setAttribute('role', 'alertdialog');
                    $('archiveCancel').focus();
                });
                $('archiveConfirm').addEventListener('click', () =>
                    status('archiveStatus', 'Sample project archived locally. Reload to reset.')
                );
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
                hover.addEventListener('keydown', event => {
                    if (event.key === 'Escape') hover.classList.add('dismissed');
                });
                hover.addEventListener('mouseleave', () => hover.classList.remove('dismissed'));
                hover.addEventListener('focusin', () => hover.classList.remove('dismissed'));
            }

            if ($('contextPopup')) {
                const context = $('contextPopup');
                $('contextTarget').setAttribute('aria-haspopup', 'menu');
                $('contextTarget').setAttribute('aria-controls', 'contextPopup');
                $('contextTarget').setAttribute('aria-expanded', 'false');
                context.addEventListener('toggle', event =>
                    $('contextTarget').setAttribute('aria-expanded', String(event.newState === 'open'))
                );
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
                        event.preventDefault();
                        closeContext();
                    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                        event.preventDefault();
                        const index = contextItems.indexOf(document.activeElement);
                        const next = event.key === 'Home' ? 0
                            : event.key === 'End' ? contextItems.length - 1
                            : (index + (event.key === 'ArrowDown' ? 1 : -1) + contextItems.length) % contextItems.length;
                        contextItems[next].focus();
                    }
                });
                contextItems.forEach(button => button.addEventListener('click', () => {
                    status('contextStatus', `${button.dataset.context} (demo).`);
                    closeContext();
                }));
                document.addEventListener('pointerdown', event => {
                    if (
                        context.matches(':popover-open') &&
                        !context.contains(event.target) &&
                        event.target !== $('contextTarget')
                    ) context.hidePopover();
                });
            }

            if ($('menubar')) {
                const menus = [...document.querySelectorAll('[role="menubar"] > .dropdown > button')];
                document.querySelector('[role="menubar"]').addEventListener('keydown', event => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const current = event.target.closest('.dropdown');
                    const index = menus.findIndex(button => button.parentElement === current);
                    const next = event.key === 'Home' ? 0
                        : event.key === 'End' ? menus.length - 1
                        : (index + (event.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length;
                    menus.forEach(button => {
                        bootstrap.Dropdown.getOrCreateInstance(button).hide();
                        button.tabIndex = -1;
                    });
                    menus[next].tabIndex = 0;
                    menus[next].focus();
                });
                document.querySelectorAll('[data-menu-action]').forEach(button => button.addEventListener('click', () =>
                    status('menuStatus', `${button.dataset.menuAction} (local demo).`)
                ));
            }

            $('directionSelect')?.addEventListener('change', () => {
                $('directionSample').dir = $('directionSelect').value;
            });

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
                handle.addEventListener('pointerdown', event => {
                    handle.setPointerCapture(event.pointerId);
                    handle.focus();
                });
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
                    selection.removeAllRanges();
                    selection.addRange(range);
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
                    if (!file) {
                        status('attachmentStatus', 'No attachment selected.');
                        return;
                    }
                    if (
                        file.size > 5 * 1024 * 1024 ||
                        !/\.(png|jpe?g|pdf|txt)$/i.test(file.name) ||
                        (file.type && !['image/png', 'image/jpeg', 'application/pdf', 'text/plain'].includes(file.type))
                    ) {
                        status('attachmentStatus', 'Unsupported file. Choose PNG, JPEG, PDF, or text up to 5 MB.');
                        $('attachmentInput').value = '';
                        return;
                    }
                    const row = document.createElement('div');
                    row.className = 'nd-item mb-2';
                    const info = document.createElement('div');
                    info.className = 'flex-grow-1';
                    const name = document.createElement('strong');
                    name.textContent = file.name;
                    const description = document.createElement('p');
                    description.className = 'small text-muted mb-0';
                    description.textContent = `${Math.ceil(file.size / 1024)} KB · Local preview ready`;
                    info.append(name, description);
                    const remove = document.createElement('button');
                    remove.className = 'btn btn-light btn-sm';
                    remove.textContent = 'Remove';
                    remove.setAttribute('aria-label', `Remove ${file.name}`);
                    remove.addEventListener('click', () => {
                        clearAttachment();
                        $('attachmentInput').value = '';
                        status('attachmentStatus', 'Attachment removed.');
                        $('attachmentInput').focus();
                    });
                    row.append(info, remove);
                    $('attachmentList').append(row);
                    if (['image/png', 'image/jpeg'].includes(file.type)) {
                        attachmentUrl = URL.createObjectURL(file);
                        const image = document.createElement('img');
                        image.src = attachmentUrl;
                        image.alt = `Preview of ${file.name}`;
                        image.addEventListener('error', () =>
                            status('attachmentStatus', 'Image could not be decoded. Remove it and choose another file.')
                        );
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

            $('conversationStyle')?.addEventListener('change', () => {
                $('message').classList.toggle('conversation-plain', $('conversationStyle').value === 'plain');
            });

            if ($('message-scroller')) {
                const viewport = $('message-scroller');
                const atBottom = () => viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 24;
                const jumpState = () => {
                    $('jumpLatest').hidden = atBottom();
                };
                const appendMessage = (name, text, outgoing = false, prepend = false) => {
                    const article = document.createElement('article');
                    article.className = `message-row${outgoing ? ' message-outgoing' : ''}`;
                    const avatar = document.createElement('span');
                    avatar.className = 'nd-avatar';
                    avatar.setAttribute('aria-hidden', 'true');
                    avatar.textContent = outgoing ? 'UK' : 'NA';
                    const content = document.createElement('div');
                    const author = document.createElement('strong');
                    author.textContent = name;
                    const bubble = document.createElement('div');
                    bubble.className = 'nd-bubble';
                    bubble.textContent = text;
                    content.append(author, bubble);
                    article.append(avatar, content);
                    if (prepend) $('messageLog').prepend(article);
                    else $('messageLog').append(article);
                    return article;
                };
                viewport.addEventListener('scroll', jumpState);
                $('jumpLatest').addEventListener('click', () => {
                    viewport.scrollTop = viewport.scrollHeight;
                    jumpState();
                });
                $('loadHistory').addEventListener('click', () => {
                    const top = viewport.scrollTop;
                    const height = viewport.scrollHeight;
                    appendMessage(
                        'NahaAdmin · Earlier',
                        'Welcome to the local component preview. Earlier messages preserve your reading position.',
                        false,
                        true
                    );
                    viewport.scrollTop = top + viewport.scrollHeight - height;
                    $('loadHistory').disabled = true;
                    status('messageStatus', 'Earlier sample message loaded.');
                    jumpState();
                });
                $('messageForm').addEventListener('submit', event => {
                    event.preventDefault();
                    const text = $('messageInput').value.trim();
                    if (!text) {
                        $('messageInput').setCustomValidity('Enter a message.');
                        $('messageInput').reportValidity();
                        return;
                    }
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
                    if (step < questions.length - 1) {
                        step++;
                        showQuestion();
                        return;
                    }
                    questions.forEach(question => {
                        question.disabled = false;
                    });
                    const data = new FormData($('questionForm'));
                    questions.forEach((question, index) => {
                        question.disabled = index !== step;
                    });
                    status(
                        'questionStatus',
                        `Saved locally: ${data.get('projectName')} · ${data.get('projectType')} · ${data.getAll('details').join(', ') || 'No optional details'}.`
                    );
                });
                $('questionPrevious').addEventListener('click', () => {
                    step--;
                    showQuestion();
                });
                $('questionSkip').addEventListener('click', () => {
                    questions[step].querySelectorAll('input').forEach(input => {
                        input.checked = false;
                    });
                    step++;
                    showQuestion();
                });
                $('questionForm').addEventListener('reset', () => {
                    step = 0;
                    showQuestion();
                });
                questions.forEach(question => question.addEventListener('invalid', event => {
                    event.target.setAttribute('aria-invalid', 'true');
                    status('questionStatus', event.target.validationMessage);
                }, true));
                $('questionForm').addEventListener('input', event => event.target.removeAttribute('aria-invalid'));
                showQuestion(false);
            }
        })();
    }

    // Dashboard Analytics
    if (document.documentElement.matches('[data-page~="dashboard-analytics"]') && window.jQuery && window.echarts) {
        /**
         * Analytics Dashboard Charts
         */
        if (typeof echarts !== 'undefined') {
            const styles = getComputedStyle(document.documentElement);
            const token = name => styles.getPropertyValue(`--${name}`).trim();
            // === BAR CHART ===
            const $barDom = $('#barChart');
            if ($barDom.length) {
                const barChart = echarts.init($barDom[0], 'naha');
                const barOption = {
                    tooltip: { trigger: 'axis' },
                    legend: { bottom: 0 },
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: { type: 'value' },
                    series: [
                        {
                            name: 'Active',
                            data: [120, 200, 150, 80, 70, 110, 130],
                            type: 'bar',
                            itemStyle: { color: token('nd-primary') }
                        },
                        {
                            name: 'Inactive',
                            data: [60, 100, 90, 40, 50, 70, 60],
                            type: 'bar',
                            itemStyle: { color: token('nd-chart-2') }
                        }
                    ]
                };
                barChart.setOption(barOption);
                $(window).on('resize', () => barChart.resize());
            }

            // === PIE CHART ===
            const $pieDom = $('#pieChart');
            if ($pieDom.length) {
                const pieChart = echarts.init($pieDom[0], 'naha');
                const pieOption = {
                    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                    legend: { bottom: 0 },
                    series: [
                        {
                            name: 'Customer Status',
                            type: 'pie',
                            radius: '65%',
                            center: ['50%', '50%'],
                            data: [
                                { value: 1048, name: 'Active', itemStyle: { color: token('nd-success') } },
                                { value: 735, name: 'Inactive', itemStyle: { color: token('nd-chart-6') } },
                                { value: 580, name: 'Pending', itemStyle: { color: token('nd-warning') } },
                                { value: 484, name: 'Banned', itemStyle: { color: token('nd-danger') } },
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: `rgba(${token('bs-body-color-rgb')}, 0.12)`
                                }
                            }
                        }
                    ]
                };
                pieChart.setOption(pieOption);
                $(window).on('resize', () => pieChart.resize());
            }
        }
    }

    // Dashboard Crm
    if (document.documentElement.matches('[data-page~="dashboard-crm"]') && window.jQuery && window.echarts) {
        /**
         * CRM Dashboard Charts
         */
        if (typeof echarts !== 'undefined') {
            const styles = getComputedStyle(document.documentElement);
            const token = name => styles.getPropertyValue(`--${name}`).trim();
            // === CRM PIPELINE CHART ===
            const $pipelineDom = $('#pipelineChart');
            if ($pipelineDom.length) {
                const pipelineChart = echarts.init($pipelineDom[0], 'naha');
                const pipelineOption = {
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: { type: 'value', boundaryGap: [0, 0.01] },
                    yAxis: { type: 'category', data: ['Proposal', 'Negotiation', 'Contact', 'New Lead'] },
                    series: [{
                        type: 'bar',
                        data: [420, 580, 890, 1200],
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: token('nd-primary') },
                                { offset: 1, color: token('nd-primary-light') }
                            ]),
                            borderRadius: [0, 4, 4, 0]
                        }
                    }]
                };
                pipelineChart.setOption(pipelineOption);
                $(window).on('resize', () => pipelineChart.resize());
            }

            // === CRM LEAD SOURCE CHART ===
            const $leadSourceDom = $('#leadSourceChart');
            if ($leadSourceDom.length) {
                const leadSourceChart = echarts.init($leadSourceDom[0], 'naha');
                const leadSourceOption = {
                    tooltip: { trigger: 'item' },
                    series: [{
                        name: 'Source',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: { borderRadius: 10, borderColor: token('nd-surface'), borderWidth: 2 },
                        label: { show: false, position: 'center' },
                        emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
                        data: [
                            { value: 1048, name: 'Google' },
                            { value: 735, name: 'Direct' },
                            { value: 580, name: 'Email' },
                            { value: 484, name: 'Ads' }
                        ]
                    }]
                };
                leadSourceChart.setOption(leadSourceOption);
                $(window).on('resize', () => leadSourceChart.resize());
            }
        }
    }

    // Dashboard Ecommerce
    if (document.documentElement.matches('[data-page~="dashboard-ecommerce"]') && window.jQuery && window.echarts) {
        /**
         * Ecommerce Dashboard Charts & Logic
         */
        if (typeof echarts !== 'undefined') {
            const styles = getComputedStyle(document.documentElement);
            const token = name => styles.getPropertyValue(`--${name}`).trim();
            // === ECOMMERCE ORDERS CHART ===
            const $ecommerceDom = $('#ecommerceOrdersChart');
            if ($ecommerceDom.length) {
                const ecommerceChart = echarts.init($ecommerceDom[0], 'naha');
                const ecommerceOption = {
                    tooltip: { trigger: 'axis' },
                    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                    yAxis: { type: 'value' },
                    series: [{
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                        type: 'line',
                        smooth: true,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: `rgba(${token('nd-primary-rgb')}, 0.16)` },
                                { offset: 1, color: `rgba(${token('nd-primary-rgb')}, 0)` }
                            ])
                        },
                        itemStyle: { color: token('nd-primary') },
                        lineStyle: { width: 3, color: token('nd-primary') }
                    }]
                };
                ecommerceChart.setOption(ecommerceOption);
                $(window).on('resize', () => ecommerceChart.resize());
            }

            // === ECOMMERCE CATEGORY CHART ===
            const $categoryDom = $('#categoryChart');
            if ($categoryDom.length) {
                const categoryChart = echarts.init($categoryDom[0], 'naha');
                const categoryOption = {
                    tooltip: { trigger: 'item' },
                    legend: { top: 'bottom' },
                    series: [{
                        name: 'Category',
                        type: 'pie',
                        radius: [20, 100],
                        roseType: 'area',
                        itemStyle: { borderRadius: 8 },
                        data: [
                            { value: 40, name: 'Electronics' },
                            { value: 38, name: 'Fashion' },
                            { value: 32, name: 'Home' },
                            { value: 30, name: 'Books' }
                        ]
                    }]
                };
                categoryChart.setOption(categoryOption);
                $(window).on('resize', () => categoryChart.resize());
            }
        }

        // Tempus Dominus v6 for Ecommerce range
        if (typeof tempusDominus !== 'undefined') {
            const $dashRangeDom = $('#dash-range');
            if ($dashRangeDom.length) {
                new tempusDominus.TempusDominus($dashRangeDom[0], {
                    display: {
                        components: { clock: false },
                        theme: 'light'
                    },
                    restrictions: { maxDate: new Date() },
                    localization: { format: 'dd MMM, yyyy' }
                });
            }
        }
    }

    // Dashboard Finance
    if (document.documentElement.matches('[data-page~="dashboard-finance"]') && window.jQuery && window.echarts) {
        /**
         * Finance Dashboard Charts
         */
        $(function () {
            if (typeof echarts !== 'undefined') {
                const styles = getComputedStyle(document.documentElement);
                const token = name => styles.getPropertyValue(`--${name}`).trim();

                // === CASH FLOW CHART (Area) ===
                const $flowDom = $('#cashFlowChart');
                if ($flowDom.length) {
                    const flowChart = echarts.init($flowDom[0], 'naha');
                    const flowOption = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross',
                                label: { backgroundColor: token('nd-secondary'), color: token('nd-text') }
                            }
                        },
                        legend: {
                            data: ['Income', 'Expenses'],
                            bottom: 0,
                            icon: 'circle'
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '10%',
                            top: '5%',
                            containLabel: true
                        },
                        xAxis: [
                            {
                                type: 'category',
                                boundaryGap: false,
                                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                axisLine: { lineStyle: { color: token('nd-border') } },
                                axisLabel: { color: token('nd-text-muted') }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                axisLine: { show: false },
                                axisLabel: { color: token('nd-text-muted') },
                                splitLine: { lineStyle: { color: token('nd-border') } }
                            }
                        ],
                        series: [
                            {
                                name: 'Income',
                                type: 'line',
                                smooth: true,
                                itemStyle: { color: token('nd-primary') },
                                lineStyle: { width: 3, color: token('nd-primary') },
                                showSymbol: false,
                                areaStyle: {
                                    opacity: 0.1,
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: token('nd-primary') },
                                        { offset: 1, color: token('nd-surface') }
                                    ])
                                },
                                emphasis: { focus: 'series' },
                                data: [2100, 2500, 2200, 2800, 3000, 3200, 3500, 3800, 4200, 4500, 4800, 5200]
                            },
                            {
                                name: 'Expenses',
                                type: 'line',
                                smooth: true,
                                itemStyle: { color: token('nd-danger') },
                                lineStyle: { width: 3, color: token('nd-danger') },
                                showSymbol: false,
                                areaStyle: {
                                    opacity: 0.1,
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: token('nd-danger') },
                                        { offset: 1, color: token('nd-surface') }
                                    ])
                                },
                                emphasis: { focus: 'series' },
                                data: [1500, 1800, 1400, 1600, 1900, 2100, 2000, 2200, 2100, 2400, 2300, 2500]
                            }
                        ]
                    };
                    flowChart.setOption(flowOption);
                    $(window).on('resize', () => flowChart.resize());
                }

                // === SPENDING CHART (Donut) ===
                const $spendingDom = $('#spendingChart');
                if ($spendingDom.length) {
                    const spendingChart = echarts.init($spendingDom[0], 'naha');
                    const spendingOption = {
                        tooltip: {
                            trigger: 'item',
                            formatter: '{b}: ${c} ({d}%)'
                        },
                        legend: {
                            bottom: '0',
                            left: 'center',
                            icon: 'circle',
                            itemWidth: 10,
                            itemHeight: 10,
                            textStyle: { fontSize: 11 }
                        },
                        series: [
                            {
                                name: 'Spending',
                                type: 'pie',
                                radius: ['40%', '70%'],
                                center: ['50%', '45%'],
                                avoidLabelOverlap: false,
                                itemStyle: {
                                    borderRadius: 10,
                                    borderColor: token('nd-surface'),
                                    borderWidth: 2
                                },
                                label: { show: false, position: 'center' },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '18',
                                        fontWeight: 'bold'
                                    }
                                },
                                labelLine: { show: false },
                                data: [
                                    { value: 1200, name: 'Rent' },
                                    { value: 800, name: 'Food' },
                                    { value: 600, name: 'Entertainment' },
                                    { value: 400, name: 'Shopping' },
                                    { value: 300, name: 'Transport' }
                                ]
                            }
                        ]
                    };
                    spendingChart.setOption(spendingOption);
                    $(window).on('resize', () => spendingChart.resize());
                }
            }
        });
    }

    // Auth Demo
    if (document.documentElement.matches('[data-page~="auth-demo"]')) {
        // Demo only: no credentials are sent, stored, or checked against an account.
        document.querySelectorAll('[data-demo-auth]').forEach((form) => {
            const password = form.querySelector('[autocomplete="new-password"]');
            const confirmation = form.querySelector('[data-confirm-password]');
            const status = form.querySelector('[role="status"]');

            function checkConfirmation() {
                if (confirmation) {
                    confirmation.setCustomValidity(confirmation.value === password.value ? '' : 'Passwords must match.');
                }
            }

            form.addEventListener('input', () => {
                checkConfirmation();
                status.textContent = '';
            });

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                checkConfirmation();
                if (!form.reportValidity()) return;
                form.reset();
                checkConfirmation();
                status.textContent = 'Demo complete. No account was accessed or created, and no email was sent.';
            });
        });
    }

    // Demo Apps Chat
    if (document.documentElement.matches('[data-page~="demo-apps-chat"]') && window.jQuery && window.SimpleBar) {
        $(function () {
            const input = document.getElementById('chatInput');
            const history = document.getElementById('chatHistory');
            const scrollArea = () => SimpleBar.instances.get(history)?.getScrollElement() || history;

            $('#chatForm').on('submit', function (event) {
                event.preventDefault();
                const text = input.value.trim();
                if (!text) {
                    input.setCustomValidity('Enter a message.');
                    input.reportValidity();
                    return;
                }
                const message = document.createElement('div');
                message.className = 'message message-outbound';
                const bubble = document.createElement('div');
                bubble.className = 'message-bubble';
                bubble.textContent = text;
                const time = document.createElement('small');
                time.className = 'text-muted extra-small mt-1';
                time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                message.append(bubble, time);
                (history.querySelector('.simplebar-content') || history).append(message);
                input.value = '';
                requestAnimationFrame(() => { scrollArea().scrollTop = scrollArea().scrollHeight; });
            });
            input.addEventListener('input', () => input.setCustomValidity(''));

            $('.chat-item').on('click', function () {
                $('.chat-item').removeClass('active').attr('aria-pressed', 'false');
                $(this).addClass('active').attr('aria-pressed', 'true');
                $('.chat-content h6').text($(this).find('h6').text());
            }).on('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.click();
                }
            });
            $('#chatSearch').on('input', function () {
                const query = this.value.trim().toLowerCase();
                $('.chat-item').each(function () { this.hidden = !this.textContent.toLowerCase().includes(query); });
            });
            $('#toggleChatList').on('click', function () {
                const contacts = document.getElementById('chatContacts');
                contacts.hidden = !contacts.hidden;
                this.setAttribute('aria-expanded', String(!contacts.hidden));
            });

            const desktop = matchMedia('(min-width: 992px)');
            desktop.addEventListener('change', event => {
                if (!event.matches) return;
                document.getElementById('chatContacts').hidden = false;
                document.getElementById('toggleChatList').setAttribute('aria-expanded', 'true');
            });
        });
    }

    // Demo Apps Inbox
    if (document.documentElement.matches('[data-page~="demo-apps-inbox"]') && window.jQuery) {
        $(function () {
            $('.email-item .star').on('click', function (e) {
                e.stopPropagation();
                $(this).toggleClass('active ph-star ph-fill');
            });

            $('.email-item').on('click', function () {
                $(this).removeClass('unread');
            });
        });
    }

    // Demo Apps Kanban
    if (document.documentElement.matches('[data-page~="demo-apps-kanban"]') && window.jQuery && window.Sortable) {
        $(function () {
            // Initialize SortableJS for each kanban column list
            $('.kanban-card-list').each(function () {
                new Sortable(this, {
                    group: 'kanban',
                    animation: 150,
                    ghostClass: 'bg-primary-subtle',
                    chosenClass: 'shadow-lg',
                    dragClass: 'opacity-50'
                });
            });
        });
    }

    // Demo Forms Basic
    if (document.documentElement.matches('[data-page~="demo-forms-basic"]') && window.jQuery && window.tempusDominus) {
        $(function () {
            // Set global defaults for Tempus Dominus to use Phosphor Icons
            tempusDominus.DefaultOptions.display.icons = {
                type: 'icons',
                time: 'ph-bold ph-clock',
                date: 'ph-bold ph-calendar-blank',
                up: 'ph-bold ph-caret-up',
                down: 'ph-bold ph-caret-down',
                previous: 'ph-bold ph-caret-left',
                next: 'ph-bold ph-caret-right',
                today: 'ph-bold ph-calendar-check',
                clear: 'ph-bold ph-trash',
                close: 'ph-bold ph-x'
            };

            const $dateEl = $('#td-date');
            if ($dateEl.length) {
                new tempusDominus.TempusDominus($dateEl[0], {
                    display: { components: { clock: false }, theme: 'light' }
                });
            }
            const $datetimeEl = $('#td-datetime');
            if ($datetimeEl.length) {
                new tempusDominus.TempusDominus($datetimeEl[0], {
                    display: { theme: 'light' }
                });
            }
            const $rangeEl = $('#td-range');
            if ($rangeEl.length) {
                new tempusDominus.TempusDominus($rangeEl[0], {
                    display: { components: { clock: false }, theme: 'light' },
                    dateRange: true,
                    multipleDatesSeparator: ' - '
                });
            }
            const $timeEl = $('#td-time');
            if ($timeEl.length) {
                new tempusDominus.TempusDominus($timeEl[0], {
                    display: { components: { clock: true, seconds: false, calendar: false, date: false, month: false, year: false }, theme: 'light' }
                });
            }
            const $monthEl = $('#td-month');
            if ($monthEl.length) {
                new tempusDominus.TempusDominus($monthEl[0], {
                    display: { components: { clock: false, calendar: true, date: false, month: true, year: true }, theme: 'light' }
                });
            }
        });
    }

    // Demo Forms Basic
    if (document.documentElement.matches('[data-page~="demo-forms-basic"]')) {
        document.getElementById('requestStatus').closest('form').addEventListener('submit', event => {
            event.preventDefault();
            document.getElementById('requestStatus').textContent = 'Request checked locally. Nothing sent or saved.';
        });
    }

    // Demo Forms Checks
    if (document.documentElement.matches('[data-page~="demo-forms-checks"]')) {
        document.getElementById('preferencesStatus').closest('form').addEventListener('submit', event => {
            event.preventDefault();
            document.getElementById('preferencesStatus').textContent = 'Preferences checked locally. Nothing saved.';
        });
    }

    // Demo Forms Editors
    if (document.documentElement.matches('[data-page~="demo-forms-editors"]') && window.jQuery && window.Quill && window.ClassicEditor && window.jQuery.fn.summernote) {
        $(function () {
            // Initialize Quill
            var quill = new Quill('#quill-editor', {
                theme: 'snow'
            });

            // Initialize Summernote
            $('#summernote').summernote({
                placeholder: 'Hello bootstrap 5',
                tabsize: 2,
                height: 300,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture', 'video']],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ]
            });

            // Initialize CKEditor
            ClassicEditor
                .create(document.querySelector('#ckeditor'))
                .catch(error => {
                    console.error(error);
                });
        });
    }

    // Demo Forms Select
    if (document.documentElement.matches('[data-page~="demo-forms-select"]') && window.jQuery && window.jQuery.fn.select2) {
        $(function () {
            $('#select2-single').select2({
                theme: 'bootstrap-5',
                width: '100%',
                placeholder: $('#select2-single').data('placeholder'),
            });

            function formatCountry(country) {
                if (!country.id) return country.text;
                var $country = $(
                    '<span><span class="fi fi-' + country.id.toLowerCase() + ' me-2"></span>' + country.text + '</span>'
                );
                return $country;
            };

            $('#select-country').select2({
                theme: 'bootstrap-5',
                width: '100%',
                placeholder: $('#select-country').data('placeholder'),
                templateResult: formatCountry,
                templateSelection: formatCountry
            });
        });
        jQuery('#selectFramework').select2({ width: '100%', minimumResultsForSearch: Infinity });
    }

    // Demo Forms Select
    if (document.documentElement.matches('[data-page~="demo-forms-select"]')) {
        document.getElementById('deliveryStatus').closest('form').addEventListener('submit', event => {
            event.preventDefault();
            document.getElementById('deliveryStatus').textContent = 'Delivery choices checked locally. Nothing sent or saved.';
        });
    }

    // Demo Forms Validation
    if (document.documentElement.matches('[data-page~="demo-forms-validation"]') && window.jQuery) {
        $(function () {
            $('.needs-validation').on('submit', function (e) {
                if (!this.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                $(this).addClass('was-validated');
            });
        });
    }

    // Demo Icons
    if (document.documentElement.matches('[data-page~="demo-icons"]') && window.bootstrap) {
        document.addEventListener('DOMContentLoaded', function () {
          const iconsContainer = document.getElementById('iconsContainer');
          const iconSearch = document.getElementById('iconSearch');
          const iconCountSpan = document.getElementById('iconCount');
          const weightInputs = document.querySelectorAll('input[name="iconWeight"]');
          const loadingState = document.getElementById('loadingState');
          const toastEl = document.getElementById('copyToast');
          const toast = new bootstrap.Toast(toastEl);

          // Icon names list (10 popular sample icons)
          const iconNames = [
            "house", "user", "gear", "bell", "envelope",
            "chart-bar", "credit-card", "magnifying-glass", "shield", "trash"
          ];

          let currentWeight = 'ph-bold';
          let searchQuery = '';

          function renderIcons() {
            const filteredIcons = iconNames.filter(name => name.includes(searchQuery));
            iconCountSpan.textContent = filteredIcons.length;

            // Clear previous content
            iconsContainer.innerHTML = '';

            if (filteredIcons.length === 0) {
              const emptyState = document.createElement('div');
              emptyState.className = 'col-12 text-center py-5';
              const message = document.createElement('p');
              message.className = 'text-muted';
              message.textContent = 'No icons found matching "' + searchQuery + '"';
              emptyState.appendChild(message);
              iconsContainer.appendChild(emptyState);
              return;
            }

            // Optimized rendering: create nodes in memory first
            const fragment = document.createDocumentFragment();
            filteredIcons.forEach(name => {
              const col = document.createElement('div');
              col.className = 'col-6 col-md-3 col-lg-2';

              const iconBox = document.createElement('div');
              iconBox.className = 'icon-box';

              const icon = document.createElement('i');
              icon.className = currentWeight + ' ph-' + name;

              const span = document.createElement('span');
              span.textContent = 'ph-' + name;

              iconBox.appendChild(icon);
              iconBox.appendChild(span);

              col.appendChild(iconBox);
              fragment.appendChild(col);
            });

            iconsContainer.appendChild(fragment);
          }

          // Initial render - slight delay to let the page settle
          setTimeout(() => {
            renderIcons();
          }, 300);

          // Search event
          iconSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderIcons();
          });

          // Weight switch event
          weightInputs.forEach(input => {
            input.addEventListener('change', (e) => {
              currentWeight = e.target.value;
              renderIcons();
            });
          });
        });
    }

    // Demo Maps
    if (document.documentElement.matches('[data-page~="demo-maps"]') && window.jQuery && window.L) {
        $(function () {
            // Indonesia Center
            var indonesiaCenter = [-0.7893, 113.9213];

            // Initialize Leaflet Map
            var map = L.map('leaflet-map').setView(indonesiaCenter, 5);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Indonesia City Markers
            var cities = [
                { name: "Jakarta", coords: [-6.2088, 106.8456] },
                { name: "Surabaya", coords: [-7.2575, 112.7521] },
                { name: "Bandung", coords: [-6.9175, 107.6191] },
                { name: "Medan", coords: [3.5952, 98.6722] },
                { name: "Makassar", coords: [-5.1476, 119.4327] },
                { name: "Yogyakarta", coords: [-7.7956, 110.3695] },
                { name: "Denpasar", coords: [-8.6705, 115.2126] }
            ];

            cities.forEach(function (city) {
                L.marker(city.coords).addTo(map)
                    .bindPopup('<b>' + city.name + '</b><br>Indonesia.')
                    .openPopup();
            });
        });
    }

    // Demo Tables Datatables
    if (document.documentElement.matches('[data-page~="demo-tables-datatables"]') && window.jQuery && window.jQuery.fn.DataTable) {
        $(function () { $('#dataTable').DataTable(); });
    }

    // Demo Tables Gridjs
    if (document.documentElement.matches('[data-page~="demo-tables-gridjs"]') && window.jQuery && window.gridjs) {
        $(function () {


            // Grid.js Initialization
            new gridjs.Grid({
                columns: ["Name", "Email", "Phone Number", "Status"],
                data: [
                    ["Atep Rizal", "atep@example.com", "(555) 123-4567", "Active"],
                    ["Lilis Suryani", "lilis@example.com", "(555) 987-6543", "Inactive"],
                    ["Ujang Kasep", "ujang@email.com", "(555) 000-1111", "Active"],
                    ["Ceu Siti", "siti@example.com", "(555) 222-3333", "Active"],
                    ["Asep Racing", "asep@example.com", "(555) 444-5555", "Pending"]
                ],
                search: true,
                sort: true,
                pagination: {
                    limit: 5
                },
                style: {
                    table: {
                        'font-size': '0.875rem'
                    }
                }
            }).render(document.getElementById("gridjs-wrapper"));
        });
    }

    // Demo Toasts
    if (document.documentElement.matches('[data-page~="demo-toasts"]') && window.jQuery && window.bootstrap && window.Swal && window.Notyf) {
        $(function () {
            const styles = getComputedStyle(document.documentElement);
            const token = name => styles.getPropertyValue(`--${name}`).trim();
            // Bootstrap Toasts
            const toastTrigger = document.getElementById('liveToastBtn')
            const toastLiveExample = document.getElementById('liveToast')
            if (toastTrigger) {
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
                toastTrigger.addEventListener('click', () => {
                    toastBootstrap.show()
                })
            }

            // Colored Toasts
            $('#successToastBtn').on('click', function () {
                const toast = new bootstrap.Toast(document.getElementById('successToast'));
                toast.show();
            });
            $('#dangerToastBtn').on('click', function () {
                const toast = new bootstrap.Toast(document.getElementById('dangerToast'));
                toast.show();
            });

            // SweetAlert2
            $('#swalBasic').on('click', function () {
                Swal.fire('Any fool can use a computer');
            });
            $('#swalSuccess').on('click', function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Everything is fine.',
                    showConfirmButton: false,
                    timer: 1500
                });
            });
            $('#swalError').on('click', function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                });
            });
            $('#swalConfirm').on('click', function () {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: token('nd-primary'),
                    cancelButtonColor: token('nd-secondary'),
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                    }
                });
            });
            $('#swalCustom').on('click', function () {
                Swal.fire({
                    title: '<strong>HTML <u>example</u></strong>',
                    icon: 'info',
                    html: 'You can use <b>bold text</b>, ' +
                        '<a href="//sweetalert2.github.io">links</a> ' +
                        'and other HTML tags',
                    showCloseButton: true,
                    showCancelButton: true,
                    focusConfirm: false,
                    confirmButtonText: '<i class="ph-bold ph-thumbs-up"></i> Great!',
                    confirmButtonAriaLabel: 'Thumbs up, great!',
                    cancelButtonText: '<i class="ph-bold ph-thumbs-down"></i>',
                    cancelButtonAriaLabel: 'Thumbs down'
                });
            });

            // Notyf
            const notyf = new Notyf({
                duration: 3000,
                position: { x: 'right', y: 'top' },
                types: [
                    { type: 'success', background: token('nd-success') },
                    { type: 'error', background: token('nd-danger') },
                    {
                        type: 'warning',
                        background: token('bs-warning-text-emphasis'),
                        icon: {
                            className: 'ph-bold ph-warning',
                            tagName: 'i',
                            color: 'white'
                        }
                    },
                    {
                        type: 'info',
                        background: token('nd-info'),
                        icon: {
                            className: 'ph-bold ph-info',
                            tagName: 'i',
                            color: 'white'
                        }
                    }
                ]
            });

            $('#notyfSuccess').on('click', function () {
                notyf.success('You have been logged in successfully!');
            });
            $('#notyfError').on('click', function () {
                notyf.error('Invalid username or password.');
            });
            $('#notyfWarning').on('click', function () {
                notyf.open({ type: 'warning', message: 'Warning! Check your settings.' });
            });
            $('#notyfInfo').on('click', function () {
                notyf.open({ type: 'info', message: 'Here is some information.' });
            });
        });
    }

    // Demo Tooltips
    if (document.documentElement.matches('[data-page~="demo-tooltips"]') && window.bootstrap) {
        // Initialize tooltips and popovers
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })

        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl)
        })
    }
})();
