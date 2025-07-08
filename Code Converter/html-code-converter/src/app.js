document.addEventListener('DOMContentLoaded', function() {
    const convertButton = document.getElementById('convertButton');
    const inputTextArea = document.getElementById('sourceCodeA');
    const outputTextArea = document.getElementById('sourceCodeB');

    convertButton.addEventListener('click', function () {
        let input = inputTextArea.value;

        // <fc> 태그 제거 및 줄별 분리
        input = input.replace(/<\/?fc>/g, '').trim();
        // HeadColor=<%=...%> 제거
        input = input.replace(/HeadColor=<%=[^%>]+%>/g, '');
        // Edit=None → Edit: false
        input = input.replace(/Edit=None/g, 'Edit: false');

        // 줄별로 분리
        const lines = input.split('\n').map(line => line.trim()).filter(line => line);

        // setFields, setColumns 생성
        let fieldsArr = [];
        let columnsArr = [];

        lines.forEach(line => {
            // id 추출
            let idMatch = line.match(/id=([a-zA-Z0-9_]+)/);
            let idValue = idMatch ? idMatch[1] : '';

            // setFields용
            if (idValue) {
                fieldsArr.push(`    {fieldName: '${idValue}', dataType: 'text'}`);
            }

            // setColumns용
            let col = line;

            // id=명칭 → name: "명칭",   fieldName: "명칭"
            col = col.replace(/id=([a-zA-Z0-9_]+)/g, 'name: "$1",   fieldName: "$1",');

            // name="Test Desc." → header: { text:"* Test Desc.", template: '<span class="" ></span> <lgcom:message code="testDe" />',},
            col = col.replace(/name="([^"]+)"/g, function(_, desc) {
                return `header: { text:"${desc}", template: '<span class: ""/> <lgcom:message code: "${idValue}" />',},`;
            });

            // width=(숫자) → width: (숫자),
            col = col.replace(/width=(\d+)/g, 'width: $1,');

            // show=true → show: true
            col = col.replace(/show=true/g, 'show: true');

            // align 변환
            col = col.replace(/align=left/g, 'styleName: "textAlignment-near",');
            col = col.replace(/align=right/g, 'styleName: "textAlignment-far",');
            col = col.replace(/align=center/g, 'styleName: "textAlignment-center",');

            // 남은 =만 :로 변환, :: 방지
            col = col.replace(/([^:])=([^=])/g, '$1: $2');

            // 보기 좋게 중괄호로 감싸기
            col = `{\n    ${col.trim()}\n}`;

            columnsArr.push(col);
        });

        // setFields, setColumns 문자열 조립
        let fieldsStr = '/* setFields 생성 */\nvar setFields = [\n' + fieldsArr.join(',\n') + '\n]\n';
        let columnsStr = '/* setColumns 생성 */\nvar setColumns = [\n' + columnsArr.join(',\n') + '\n]';

        outputTextArea.value = fieldsStr + '\n\n' + columnsStr;
    });
});