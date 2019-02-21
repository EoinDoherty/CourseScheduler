class_list = []
srcdb = '2191'

saved_classes = {}
calendar_classes = {}

$(document).ready(function(event) {
    $('input[name=srcdb]').val('2191');
    $('#submit_search').click(function() {
        kw = $('input[name=keyword]')[0].value;
        srcdb = $('input[name=srcdb]')[0].value;
        if (kw == '') {
            alert('Search query cannot be blank');
            return;
        }
        $('.search_results .loader').addClass('active')
        $.ajax({
            type: 'POST',
            url: '/search',
            data: {
                'type': 'keyword',
                'keyword': kw,
                'srcdb': srcdb,
            },
            success: proc_keyword_data
        });
    });
    $('#get_cart').click(function() {
        getCart();
    });
    $('#sidebar_button').click(function() {
        $('.ui.sidebar').sidebar('toggle');
    });
    generateTable();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if (password = $('.ui.modal.login input[type="password"]').val().length>0)
                submitCULogin(console.log)
        }
    });
});

function generateTable() {
    let columns = 6;
    let rows = (10 + 12 - 8) * 4; //(9pm - 8pm)
    for (var r = 0; r < rows; r++) {
        hour = (Math.floor(r / 4) + 8)
        let row = $.parseHTML('<tr></tr>');
        if (r % 4 == 0) {
            $(row).append($.parseHTML(`<td class="warning" rowspan="4">${hour%12==0?12:hour%12}:00${hour>11?'pm':'am'}</td>`))
        }
        for (var c = 1; c < columns; c++) {
            $(row).append($.parseHTML(`<td name=${c}></td>`))
        }
        $('.calendar').append(row)
    }
}

function getTimes(course) {
    ele = $(course.meeting_html)[0]
    ele = ele.innerText
    time = ele.substring(0, ele.indexOf(' in'));
    days = '';
    if (time.search('F') > -1) {
        days = '1' + days;
        time = time.replace('F', '')
    } else days = '0' + days;
    if (time.search('Th') > -1) {
        days = '1' + days;
        time = time.replace('Th', '')
    } else days = '0' + days;
    if (time.search('W') > -1) {
        days = '1' + days;
        time = time.replace('W', '')
    } else days = '0' + days;
    if (time.search('T') > -1) {
        days = '1' + days;
        time = time.replace('T', '')
    } else days = '0' + days;
    if (time.search('M') > -1) {
        days = '1' + days;
        time = time.replace('M', '')
    } else days = '0' + days;
    t1 = time.substring(1, time.indexOf('-'))
    t2 = time.substring(time.indexOf('-') + 1)

    ind1 = 0;
    off1 = 0;
    ind2 = 0;
    off2 = 0;
    if (t1.search(':') > -1) {
        ind1 += parseInt(t1.substring(0, t1.search(':'))) - 8;
        off1 = Math.round(parseInt(t1.substring(t1.search(':') + 1, t1.search('m') - 1)) / 15);
    } else {
        ind1 += parseInt(t1.substring(0, t1.search('m') - 1)) - 8;
    }
    if (t2.search(':') > -1) {
        ind2 += parseInt(t2.substring(0, t2.search(':'))) - 8;
        off2 = Math.round(parseInt(t2.substring(t2.search(':') + 1, t2.search('m') - 1)) / 15);
    } else {
        ind2 += parseInt(t2.substring(0, t2.search('m') - 1)) - 8;
    }
    if (ind1 < 4 && t1.search('pm') > -1) {
        ind1 += 12;
    }
    if (ind2 < 4 && t2.search('pm') > -1) {
        ind2 += 12;
    }
    ind1 *= 4;
    ind2 *= 4;
    return {
        'start': ind1 + off1 + 1,
        'end': ind2 + off2 + 1,
        'days': days,
        'name': `${course.code} - ${course.section}`
    }
}

function addClassToCalendar(course) {
    course = JSON.parse(course);
    times = getTimes(course);
    rcol = randomColor()
    for (i = times.start; i < times.end; i++) {
        row = $('.calendar')[0].rows[i];
        addOne = 0;
        for (j = 0; j < 5; j++) {
            if (days.charAt(j) == 0) {
                continue;
            }
            var cell;
            for (k = 0; k < row.cells.length; k++) {
                cellk = $(row.cells[k]);
                if (cellk.attr('name') == (j + 1).toString()) {
                    cell = cellk;
                    break;
                } else {
                    continue;
                }
            }
            if (i == times.start) {
                cell.attr('rowspan', times.end - times.start);
                cell.append(`<div class="event" style="--color:${rcol}">${times.name}</div>`)
            } else {
                cell.remove();
            }
        }
    }
}

function removeClassFromCalendar(course) {
    course = JSON.parse(course);
    times = getTimes(course);
    for (i = times.start; i < times.end; i++) {
        row = $('.calendar')[0].rows[i];
        addOne = 0;
        if ($(row.cells[0]).hasClass('warning')) {
            addOne = 1;
        }
        for (j = 0; j < 5; j++) {
            if (days.charAt(j) == 0) {
                continue;
            }
            if (i == times.start) {
                let cellk;
                let goodK;
                for (k = 0; k < row.cells.length; k++) {
                    if ($(row.cells[k]).attr('name') == (j + 1).toString()) {
                        cellk = row.cells[k];
                        goodK = k;
                    }
                }
                if (cellk) {
                    $(cellk).removeAttr('rowspan');
                    $(cellk).empty();
                }
            } else {
                if (row.cells.length < j) {
                    c = row.insertCell(row.cells.length);
                    $(c).attr('name', (j + 1).toString());
                } else {
                    let cellk;
                    let goodK;
                    for (k = 0; k < row.cells.length; k++) {
                        if (parseInt($(row.cells[k]).attr('name')) < (j + 1)) {
                            cellk = row.cells[k];
                            goodK = k;
                        }
                    }
                    if (cellk) {
                        c = row.insertCell(goodK + 1);
                        $(c).attr('name', (j + 1).toString());
                    } else {
                        c = row.insertCell(addOne);
                        $(c).attr('name', (j + 1).toString());
                    }
                }
            }
        }
    }
}

function toggleShowCourse(div, data = false) {
    if (data) {
        crn = JSON.parse(div).crn;
    } else {
        crn = $(div).attr('name').trim();
    }
    if (crn in calendar_classes) {
        removeClassFromCalendar(calendar_classes[crn]);
        delete calendar_classes[crn];
    } else {
        if (crn in saved_classes) {
            calendar_classes[crn] = saved_classes[crn];
            addClassToCalendar(saved_classes[crn]);
        }
    }
}

function proc_keyword_data(data) {
    if (data == "Unauthorized") {
        return;
    }
    data = JSON.parse(data)
    if (data.count <= 0) {
        alert(data)
    }
    class_list = data.results;
    $('.search_results .ui.cards').empty();
    var i = 0;
    curr_class = class_list[0].code;
    while (i < class_list.length) {
        counts = {}
        curr_class = class_list[i].code;
        curr_title = class_list[i].title
        while (i < class_list.length && class_list[i].code == curr_class) {
            key = class_list[i].schd
            if (key in counts) {
                counts[key] += 1
            } else {
                counts[key] = 1
            }
            i += 1
        }
        //Build card
        card_html = `<div class="card"><div class="content"><div class="header">${curr_class}</div>`;
        card_html += `<div class="description">${class_list[i-1].title}</div>`;
        card_html += `<br/>`
        card_html += '<div class="meta">';
        //TODO: Implement better code mapping
        if ('LEC' in counts) {
            card_html += `${counts['LEC']} lectures, `
        }
        if ('REC' in counts) {
            card_html += `${counts['REC']} recitations, `
        }
        if ('LAB' in counts) {
            card_html += `${counts['LAB']} labratories, `
        }
        if ('SEM' in counts) {
            card_html += `${counts['SEM']} seminars, `
        }
        if ('PRA' in counts) {
            card_html += `${counts['PRA']} practicums, `
        }
        card_html = card_html.slice(0, -2);
        card_html += `</div></div><div class="ui bottom attached button" onclick="view_sections(${i})">View Sections</div></div>`
        card = $.parseHTML(card_html)
        $('.search_results .ui.cards').append(card)
        $(card).popup({
            html: `<h3>${curr_class} - ${curr_title}</h3><div id="popup_temp" class="ui active text loader">Getting Details...</div>`,
            position: 'right center',
            on: 'click',
            target: '.search_bar',
            setFluidWidth: false,
            onShow: function() {
                $(this).css({
                    'top': '0px',
                    'max-width': '850px',
                    'max-height': '100%',
                    'overflow-y': 'scroll',
                    'overflow-x': 'hidden'
                });
            },
            onVisible: function() {
                $(this).css({
                    'top': '0px',
                    'max-width': '850px',
                    'max-height': '100%',
                    'overflow-y': 'scroll',
                    'overflow-x': 'hidden'
                });
            }
        });
    }
    $('.search_results .loader').removeClass('active');
}

function view_sections(i) {
    last = i - 1
    curr_class = class_list[last].code
    crns = ''
    ind = last
    while (ind >= 0 && class_list[ind].code == curr_class) {
        crns = ',' + class_list[ind].crn + crns
        ind -= 1
    }
    crns = crns.slice(1)
    $.ajax({
        type: 'POST',
        url: '/search',
        data: {
            'type': 'view_sections',
            'group': `code:${curr_class}`,
            'key': '',
            'matched': `crn:${crns}`,
            'srcdb': srcdb
        },
        success: function(data) {
            showDetails(data);
        }
    });
}

function showDetails(data) {
    $('.ui.popup').children().remove();
    $('#popup_temp').removeClass('active');
    data = JSON.parse(data)
    popup_html = `<h3>${data.code} - ${data.title}</h3><div id="popup_temp" class="ui active text loader">Getting Details...</div>`;
    popup_html += `<a class="ui black left ribbon label">Last Updated: ${data.last_updated}</a><br/>`
    popup_html += `<strong>Credit Hours:</strong> <span>${data.hours_text}</span><br/>`;
    if (data.seats == "Varies by section")
        popup_html += "<strong>Max Seats:</strong>"
    popup_html += `<span>${data.seats}</span><br/>`
    if (data.restrict_info != "")
        popup_html += `<span class="info_head">Registration Restrictions</span> <p>${data.restrict_info}</p>`
    if (data.clssnotes != "")
        popup_html += `<span class="info_head">Class Notes</span> <p>${data.clssnotes}</p>`
    popup_html += `<span class="info_head">Course Description</span> <p>${data.description}</p>`
    popup_html += `<span class="info_head">Schedule and Location</span> <p>${data.meeting_html}</p>`;
    popup_html += `<span class="info_head">Instructors</span> <p>${data.instructordetail_html}</p>`;
    bad_section_element = $.parseHTML(data.all_sections);
    headers = $($(bad_section_element).children()[0]).children();
    table = '<table class="ui selectable celled table"><thead><tr><th>Saved</th>'
    for (j = 0; j < headers.length; j++) {
        table += `<th>${headers[j].innerText}</th>`;
    }
    table += '</tr></thead>'
    rows = $(bad_section_element).children().slice(1)
    for (r = 0; r < rows.length; r++) {
        cells = rows[r].children
        id = cells[0].innerText
        id = id.substring(id.indexOf(':') + 1).trim()
        row = `<tr onclick="selectCourseRow(this)"><td><div class="ui checkbox"><input type="checkbox" name="${id}" `;
        if (class_saved(id)) {
            row += 'checked';
        }
        row += `><label></label></div></td>`
        for (c = 0; c < cells.length; c++) {
            txt = cells[c].innerText
            txt = txt.substring(txt.indexOf(':') + 1)
            row += `<td>${txt}</td>`;
        }
        row += '</tr>'
        table += row
    }
    table += '</table>'
    popup_html += table
    if (data.crn!='Varies by section'){
        popup_html +=  `<div style="text-align:right;"><div class="field">
            <div class="ui selection dropdown">
                <input type="hidden" name="gmod" value="LTR">
                <div style="color:rgb(0, 0, 0)" class="default text">Letter</div>
                <i class="dropdown icon"></i>
                <div class="menu">`;
        if (data.gmods.indexOf('LTR')>=0){
            popup_html += `<div class="item" data-value="LTR">
                Letter
            </div>`;
        }
        if (data.gmods.indexOf('NOC')>=0){
            popup_html += `<div class="item" data-value="NOC">
                No Credit Basis (Audit)
            </div>`;
        }
        if (data.gmods.indexOf('PF4')>=0)
            popup_html += `<div class="item" data-value="PF4">
                Pass/Fail
            </div>`;
        popup_html += `</div>
            </div>
        </div>
        <button class="ui secondary button" onclick="addToCart(['${data.gmods}', '${data.crn}'])">
                        Add to Cart
                        </button></div>`;
    }
    $('.ui.popup').append(popup_html);
    $('.ui.popup input[type="checkbox"]').click(function(event) {
        toggleSaveCourse($(this));
        event.stopPropagation();
    })
    $('.ui.dropdown').dropdown();
    $('#popup_temp').removeClass('active');
}

function addToCart(data){
    if (!firebase.auth().currentUser){
        $('.ui.modal.google').modal('show');
        return;
    }
    params = {
        'p_term_code':srcdb,
        'p_crn':data[1],
        'p_gmod':$('input[name=gmod]')[0].value,
        'uid':firebase.auth().currentUser.uid,
        'cutoken':window.sessionStorage.getItem('token'),
    }
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        params['token'] = idToken
        $.ajax({
            type: 'POST',
            url: '/addcart',
            data: params,
            success: function(data){
                data = JSON.parse(data.slice(8, -3))
                console.log(data)
                data = data['cart']
                for (i = 0; i<data.length; i++){
                    c = data[i]
                    yr = c.split('|')[0]
                    if (yr!=srcdb){
                        data.splice(i, 1)
                        i--
                    }
                }
                console.log(data)
                bad = JSON.parse(window.sessionStorage.getItem('dict'))
                bad['cart']=data; //Not bad anymore lol
                window.sessionStorage.setItem('dict', JSON.stringify(bad))
                window.sessionStorage.setItem('updated_cart', true)
            }
        });
    }).catch(function(error) {
        console.log(error);
        $('.search_results .loader').removeClass('active')
    });
}

function class_saved(id) {
    keys = Object.keys(saved_classes);
    for (i = 0; i < keys.length; i++) {
        if (keys[i] == id.toString()) return true;
    }
    return false;
}

function showCULogin(action = console.log) {
    $('.ui.modal.login').modal({
        closable: false,
        onDeny: function() {
        },
        onApprove: function() {
            submitCULogin(action);
            return false;
        }
    }).modal('show');
}

function submitCULogin(action){
    $('.ui.modal.login .loader').text('Logging In...');
    $('.ui.modal.login .segment').css('display', 'block');
    username = $('.ui.modal.login input[type="text"]').val();
    password = $('.ui.modal.login input[type="password"]').val();
    getCUAuthToken(username, password, action);
}

function getCUAuthToken(username, password, action) {
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        $.ajax({
            type: 'POST',
            url: '/culogin',
            data: {
                'username': username,
                'password': password,
                'uid': firebase.auth().currentUser.uid,
                'token': idToken
            },
            success: function(data) {
                if (data=="Auth Fail"){
                    console.log(data)
                } else {
                    data = data.split("'").join('"')
                    data = data.split("False").join('false')
                    data = JSON.parse(data)
                    window.sessionStorage.setItem('token', data[0])
                    window.sessionStorage.setItem('dict', JSON.stringify(data[1]))
                    window.sessionStorage.setItem('updated_cart', false)
                    $('.ui.modal.login').modal('hide', false);
                    action()
                }
            }
        })
    }).catch(function(error) {
        console.log(error);
    });
}

function getCartCrns(){
    bad = JSON.parse(window.sessionStorage.getItem('dict'))
    crns = ''
    for (i = 0; i<bad['cart'].length; i++){
        crn = bad['cart'][i].split('|')[2]
        crns += (crn + ',')
    }
    for (i = 0; i<bad['reg'][srcdb].length; i++){
        crn = bad['reg'][srcdb][i].split('|')[1]
        crns += (crn + ',')
    }
    return crns
}

function getCart() {
    if (!firebase.auth().currentUser){
        $('.ui.modal.google').modal('show');
        return;
    }
    token = window.sessionStorage.getItem('token');
    if (!token) {
        showCULogin(getCart);
        return;
    }
    $('.search_results .loader').addClass('active')
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        if (window.sessionStorage.getItem('updated_cart')=="true"){
            dict = JSON.parse(window.sessionStorage.getItem('dict'))
            cart = dict['cart']
            reg = dict['reg'][srcdb]
            for (i = 0; i<cart.length; i++){
                c = cart[i]
                yr = c.split('|')[0]
                if (yr!=srcdb){
                    cart.splice(i, 1)
                    i--
                }
            }
            crns = getCartCrns()
            $.ajax({
                type: 'POST',
                url: '/getcrns',
                data: {
                    'uid':firebase.auth().currentUser.uid,
                    'token':idToken,
                    'cutoken':token,
                    'srcdb':srcdb,
                    'crns': crns
                },
                success: function(data){
                    proc_keyword_data(data)
                },
                error: function(xhr, st, er){
                    console.log(er)
                    $('.search_results .loader').removeClass('active')
                }
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/getcart',
                data: {
                    'uid':firebase.auth().currentUser.uid,
                    'token':idToken,
                    'cutoken':token,
                    'srcdb':srcdb
                },
                success: function(data){
                    data = data.split("'").join('"')
                    data = JSON.parse(data)
                    for (i = 0; i<data.length; i++){
                        if (data[i].split('|')[0]!=srcdb){
                            data.splice(i, 1)
                            i--
                        }
                    }
                    bad = JSON.parse(window.sessionStorage.getItem('dict'))
                    bad['cart']=data; //Not bad anymore lol
                    window.sessionStorage.setItem('dict', JSON.stringify(bad))
                    window.sessionStorage.setItem('updated_cart', true)
                    crns = getCartCrns()
                    $.ajax({
                        type: 'POST',
                        url: '/getcrns',
                        data: {
                            'uid':firebase.auth().currentUser.uid,
                            'token':idToken,
                            'cutoken':token,
                            'srcdb':srcdb,
                            'crns': crns
                        },
                        success: function(data){
                            proc_keyword_data(data)
                        },
                        error: function(xhr, st, er){
                            console.log(er)
                            $('.search_results .loader').removeClass('active')
                        }
                    });
                },
                error: function(xhr, st, er){
                    console.log(er)
                    $('.search_results .loader').removeClass('active')
                }
            });
        }
    }).catch(function(error) {
        console.log(error);
        $('.search_results .loader').removeClass('active')
    });
}

function selectCourseRow(course) {
    code = $('.ui.popup h3')[0].innerText.slice(0, 9);
    crn = course.children[1].innerText;
    $.ajax({
        type: 'POST',
        url: '/search',
        data: {
            'type': 'view_sections',
            'group': `code:${code}`,
            'key': `crn:${crn}`,
            'matched': `crn:${crn}`,
            'srcdb': srcdb
        },
        success: function(data) {
            showDetails(data);
        }
    })
}

function toggleSaveCourse(course) {
    code = $('.ui.popup h3')[0].innerText.slice(0, 9);
    crn = course[0].name.trim();
    if (course[0].checked) {
        $.ajax({
            type: 'POST',
            url: '/search',
            data: {
                'type': 'view_sections',
                'group': `code:${code}`,
                'key': `crn:${crn}`,
                'matched': `crn:${crn}`,
                'srcdb': srcdb
            },
            success: function(data) {
                saved_classes[crn] = data;
                updateCourseList()
                toggleShowCourse(data, true);
            }
        });
    } else {
        dat = saved_classes[crn];
        delete saved_classes[crn];
        updateCourseList()
        toggleShowCourse(dat, true);
    }
}

function updateCourseList() {
    dis = $('#save_display');
    dis.children().remove()
    var sorted = [];
    for (var key in saved_classes) {
        sorted[sorted.length] = key;
    }
    sorted.sort();
    for (var s in sorted) {
        v = JSON.parse(saved_classes[sorted[s]]);
        code = v.code;
        if (v.hours_text.includes('Lec')) {
            code += ' - LEC';
        } else if (v.hours_text.includes('Rec')) {
            code += ' - REC';
        } else if (v.hours_text.includes('Lab')) {
            code += ' - LAB';
        } else if (v.hours_text.includes('Sem')) {
            code += ' - SEM';
        } else if (v.hours_text.includes('Pra')) {
            code += ' - PRA';
        }
        ele = $(v.meeting_html)[0]
        ele = ele.innerText
        time = ele.substring(0, ele.indexOf(' in'));
        html = `<div class="item"><div class="right floated content"><div name="${v.crn}" class="ui mini toggle button" style="padding:10px;" onclick="toggleShowCourse(this)">
            Toggle</div></div><div id="course_item" class="ui label" style="padding:1px;padding-top:10px;">${code}
            <div class="detail">${time}</div></div></div>`;
        dis.append(html);
    }
}
