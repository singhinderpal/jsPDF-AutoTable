/*
 |--------------------------------------------------------------------------
 | This file contains examples of how to use this plugin
 |--------------------------------------------------------------------------
 |
 | To see what the documents generated by these examples looks like you can open
 | ´examples.html´ or go to http://simonbengtsson.github.io/jsPDF-AutoTable.
 |
 | To make it possible to view each example in examples.html some extra code
 | are added to the examples below. For example they return their jspdf
 | doc instance and gets generated data from the library faker.js. However you
 | can of course use this plugin how you wish and the simplest first example
 | below would look like this without any extras:
 |
 | var columns = ["ID", "Name", "Age", "City"];
 |
 | var data = [
 |     [1, "Jonathan", 25, "Gothenburg"],
 |     [2, "Simon", 23, "Gothenburg"],
 |     [3, "Hanna", 21, "Stockholm"]
 | ];
 |
 | var doc = new jsPDF();
 | doc.autoTable(columns, data);
 | doc.save("table.pdf");
 |
 */

var faker = window.faker;
var base64Img = null;

var examples = {};

// Basic - shows what a default table looks like
examples.basic = function () {
    var doc = new jsPDF();
    doc.autoTable({
        columns: columns(),
        data: data(),
    });
    doc.autoTable({head: headRows(), body: bodyRows()});
    return doc;
};

// From html - shows how pdf tables can be be drawn from html tables
examples.html = function () {
    var doc = new jsPDF();
    doc.text("From HTML Table", 14, 16);
    doc.autoTable({html: '.table', startY: 20});
    var finalY = doc.previousAutoTable.finalY;
    doc.text("From HTML Table with CSS", 14, finalY + 15);
    doc.autoTable({
        startY: finalY + 20,
        html: '.table', 
        useCss: true,
    });
    return doc;
};

// Minimal - shows how compact tables can be drawn
examples.minimal = function () {
    var doc = new jsPDF();
    doc.autoTable({
        head: headRows(),
        body: bodyRows(),
        tableWidth: 'wrap',
        styles: {cellPadding: 0.5, fontSize: 8}
    });
    return doc;
};

// Long data - shows how the overflow features looks and can be used
examples.long = function () {
    var doc = new jsPDF('l');
    doc.text("Overflow 'ellipsize'", 14, 15);
    let head = headRows();
    head[0]['text'] = 'Text';
    let body = bodyRows(4);
    body.forEach(function(row) {row['text'] = faker.lorem.sentence(20)});
    doc.autoTable(20, {
        head: head,
        body: body,
        styles: {overflow: 'ellipsize', cellWidth: 'wrap'},
        columnStyles: {text: {cellWidth: 'auto'}}
    });
    doc.text("Overflow 'hidden'", 14, doc.previousAutoTable.finalY + 10);
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 15,
        head: head,
        body: body,
        styles: {overflow: 'hidden', cellWidth: 'wrap'},
        columnStyles: {text: {cellWidth: 'auto'}}
    });

    doc.text("Overflow 'linebreak' (default)", 14, doc.previousAutoTable.finalY  + 10);
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 15,
        head: head,
        body: body,
        bodyStyles: {valign: 'top'},
        styles: {overflow: 'linebreak', cellWidth: 'wrap'},
        columnStyles: {text: {cellWidth: 'auto'}}
    });

    return doc;
};

// Content - shows how tables can be integrated with any other pdf content
examples.content = function () {
    var doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('With content', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    var text = doc.splitTextToSize(faker.lorem.sentence(45), doc.internal.pageSize.width - 35, {});
    doc.text(text, 14, 30);

    doc.autoTable({
        head: headRows(),
        body: bodyRows(40),
        startY: 50, 
        showHead: 'firstPage'
    });

    doc.text(text, 14, doc.autoTable.previous.finalY + 10);

    return doc;
};

// Multiple - shows how multiple tables can be drawn both horizontally and vertically
examples.multiple = function () {
    var doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Multiple tables", 14, 20);
    doc.setFontSize(12);

    doc.autoTable(30, {head: headRows(), body: bodyRows(25)});
    
    let pageNumber = doc.internal.getCurrentPageInfo().pageNumber;

    doc.autoTable({
        head: headRows(), body: bodyRows(15),
        startY: 240,
        showHead: 'firstPage',
        styles: {overflow: 'hidden'},
        margin: {right: 107}
    });
    
    doc.setPage(pageNumber);

    doc.autoTable({
        head: headRows(),
        body: bodyRows(15),
        startY: 240,
        showHead: 'firstPage',
        styles: {overflow: 'hidden'},
        margin: {left: 107}
    });

    for (var j = 0; j < 3; j++) {
        doc.autoTable({
            head: headRows(), 
            body: bodyRows(),
            startY: doc.autoTable.previous.finalY + 10,
            avoidTableSplit: true,
        });
    }

    return doc;
};

// Header and footers - shows how header and footers can be drawn
examples['header-footer'] = function () {
    var doc = new jsPDF();
    var totalPagesExp = "{total_pages_count_string}";

    doc.autoTable({
        head: headRows(), 
        body: bodyRows(40),
        didDrawPage: function (data) {
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.setFontStyle('normal');
            if (base64Img) {
                doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10);
            }
            doc.text("Report", data.settings.margin.left + 15, 22);

            // Footer
            var str = "Page " + data.pageCount;
            // Total page number plugin only available in jspdf v1.0+
            if (typeof doc.putTotalPages === 'function') {
                str = str + " of " + totalPagesExp;
            }
            doc.setFontSize(10);
            doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
        margin: {top: 30}
    });

    // Total page number plugin only available in jspdf v1.0+
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    return doc;
};

// Minimal - shows how compact tables can be drawn
examples.defaults = function () {
    // Global defaults
    // (would apply to all documents if more than one were created)
    jsPDF.autoTableSetDefaults({
        columnStyles: {id: {fontStyle: 'bold'}},
        headStyles: {fillColor: 0},
    });

    var doc = new jsPDF();

    // Document defaults
    doc.autoTableSetDefaults({
        headStyles: {fillColor: [155, 89, 182]}, // Purple
        margin: {top: 25},
        addPageContent: function(data) {
            doc.setFontSize(20);
            doc.text('Default options', data.settings.margin.left, 20);
        }
    });

    doc.autoTable({head: headRows(), body: bodyRows()});

    doc.addPage();

    doc.autoTable({
        head: headRows(), 
        body: bodyRows(),
        // Will override document and global head tyles
        headStyles: {fillColor: [231, 76, 60]} // Red
    });

    // Reset defaults
    doc.autoTableSetDefaults(null);
    jsPDF.autoTableSetDefaults(null);

    return doc;
};

// Column styles - shows how tables can be drawn with specific column styles
examples.colstyles = function () {
    var doc = new jsPDF();
    doc.autoTable({
        head: headRows(), 
        body: bodyRows(),
        showHead: false,
        // Note that the "id" key below is the same as the column's dataKey used for 
        // the head and body rows. If your data is entered in array form instead you have to 
        // use the integer index instead i.e. `columnStyles: {5: {fillColor: [41, 128, 185], ...}}`
        columnStyles: {
            id: {fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold'}
        }
    });
    return doc;
};


// Col spans and row spans
examples.spans = function() {
    var doc = new jsPDF('p', 'pt');
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFontStyle('bold');
    doc.text('Rowspan and colspan', 40, 50);

    let body = bodyRows(40);
    for (var i = 0; i < body.length; i++) {
        var row = body[i];
        if (i % 5 === 0) {
            row['id'] = {rowSpan: 5, content: i / 5 + 1, styles: {valign: 'middle', halign: 'center'}};
        }
    }
    let head = headRows();
    head.unshift({id: {content: 'People', colSpan: 5, styles: {halign: 'center', fillColor: [22, 160, 133]}}});
    
    doc.autoTable({
        startY: 60,
        head: head, 
        body: body,
        theme: 'grid'
    });
    return doc;
};

// Themes - shows how the different themes looks
examples.themes = function () {
    var doc = new jsPDF();
    doc.setFontSize(12);
    doc.setFontStyle('bold');

    doc.text('Theme "striped"', 14, 16);
    doc.autoTable({head: headRows(), body: bodyRows(5), startY: 20});

    doc.text('Theme "grid"', 14, doc.autoTable.previous.finalY + 10);
    doc.autoTable({head: headRows(), body: bodyRows(5), startY: doc.autoTable.previous.finalY + 14, theme: 'grid'});

    doc.text('Theme "plain"', 14, doc.autoTable.previous.finalY + 10);
    doc.autoTable({head: headRows(), body: bodyRows(5), startY: doc.autoTable.previous.finalY + 14, theme: 'plain'});

    return doc;
};

// Event handler - shows how the event handler can be used to create a customized table
examples.events = function () {
    var doc = new jsPDF();

    doc.autoTable({
        head: ['ID', 'Name', 'Age'],
        body: [[1, 'Simon', 25], [2, 'Karl', 20]],
        foot: ['ID', 'Name', 'Age'],
    });
    
    // 1. Array only columns and body
    // 2. Raw json data from server {name: 'String'} style
    // Multiple header rows
    // Footer
    // Colspan and rowspan

    doc.autoTable({
        head: {id: 'ID', name: 'Name', age: 'Age'},
        body: [{id: 1, name: 'Simon', age: 25}, {id: 2, name: 'Karl', age: 25}],
        foot: {id: 'ID', name: 'Name', age: 'Age'},
    });

    doc.autoTable({
        head: {id: 'ID', name: 'Name', age: 'Age'},
        body: [{id: 1, name: 'Simon', age: 25}, {id: 2, name: 'Karl', age: 25}],
        foot: {id: 'ID', name: 'Name', age: 'Age'},
    });
    
    doc.autoTable({
        head: [{title: 'ID', field: 'id'}, {title: 'Name', field: 'name'}, {title: 'Age', field: 'age'}],
        body: [{id: 1, name: 'Simon', age: 25}, {id: 2, name: 'Karl', age: 25}],
        foot: [{title: 'ID', field: 'id'}, {title: 'Name', field: 'name'}, {title: 'Age', field: 'age'}],
    });

    doc.autoTable({
        columns: ['ID', 'Name', 'Age'],
        content: [[1, 'Simon', 25], [2, 'Karl', 20]],
    });

    doc.autoTable({
        columns: {id: 'ID', name: 'Name', age: 'Age'},
        content: [{id: 1, 1: 'Simon', 2: 25}, [2, 'Karl', 20]],
    });

    doc.autoTable({
        allSectionHooks: false,
        
        // Use for customizing texts or styles of specific cells. 
        willParseCell: function(data) {
            if (cell.section === 'body') {
                
            }
        },
        // Use for customizing texts or styles of specific cells after they have been formatted by this plugin. 
        // This hook is called just before the column width and other features are computed.
        didParseCell: function(data) {
            
        },
        // Use for changing styles with jspdf functions or customize the positioning of cells or cell text
        // just before they are drawn to the page.
        willDrawCell: function(data) {
            
        },
        // Use for adding content to the cells after they are drawn. This could be images or links.
        // You can also use this to draw other custom jspdf content to cells with doc.text or doc.rect 
        // for example.
        didDrawCell: function(data) {
            
        },
        // Use this to add content to each page that has the autoTable on it. This includes page headers,
        // page footers and page numbers for example.
        didDrawPage: function(data) {
            
        },
    });
    
    return doc;
};

// Custom style - shows how custom styles can be applied
examples.custom = function () {
    var doc = new jsPDF();
    doc.autoTable({
        head: headRows(), body: bodyRows(),
        tableLineColor: [243, 156, 18],
        tableLineWidth: 0.75,
        styles: {
            font: 'courier',
            lineColor: [44, 62, 80],
            lineWidth: 1
        },
        headStyles: {
            fillColor: [44, 62, 80],
            fontSize: 15
        },
        bodyStyles: {
            fillColor: [52, 73, 94],
            textColor: 240
        },
        alternateRowStyles: {
            fillColor: [74, 96, 117]
        },
        // Note that the "email" key below is the same as the column's dataKey used for 
        // the head and body rows. If your data is entered in array form instead you have to 
        // use the integer index instead i.e. `columnStyles: {5: {fillColor: [41, 128, 185], ...}}`
        columnStyles: {
            email: {
                fontStyle: 'bold'
            }
        },
        willParseCell: function(data) {
            // You can add jspdf-autotable styles to cells or rows in the cell parsing hooks hook
            if (data.row.index === 5) {
                data.cell.styles.fillColor = [40, 170, 100];
            }
        },
        willDrawCell: function(data) {
            // You can use the native jspdf styling functions in the willDrawCell hook
            if (data.column.dataKey === "expenses" && data.cell.raw > 500) {
                doc.setFillColor(190, 60, 40);
            }
        },
    });
    return doc;
};

/*
 |--------------------------------------------------------------------------
 | Below is some helper functions for the examples
 |--------------------------------------------------------------------------
 */

function headRows() {
    return [{id: 'ID', name: 'Name', email: 'Email', city: 'City', expenses: 'Expenses'}];
}

function footRows() {
    return [{id: 'ID', name: 'Name', email: 'Email', city: 'City', expenses: 'Expenses'}];
}

function columns() {
    return [
        {header: 'ID', dataKey: 'id'},
        {header: 'Name', dataKey: 'name'},
        {header: 'Email', dataKey: 'email'},
        {header: 'City', dataKey: 'city'},
        {header: 'Exp', dataKey: 'expenses'},
    ]
}

function data(rowCount) {
    rowCount = rowCount || 10;
    let body = [];
    for (var j = 1; j <= rowCount; j++) {
        body.push({
            id: j,
            name: faker.name.findName(),
            email: faker.internet.email(),
            city: faker.address.city(),
            expenses: faker.finance.amount(),
        });
    }
    return body;
}

function bodyRows(rowCount) {
    rowCount = rowCount || 10;
    let body = [];
    for (var j = 1; j <= rowCount; j++) {
        body.push({
            id: j,
            name: faker.name.findName(),
            email: faker.internet.email(),
            city: faker.address.city(),
            expenses: faker.finance.amount(),
        });
    }
    return body;
}

imgToBase64('document.jpg', function(base64) {
    base64Img = base64;
});

// You could either use a function similar to this or pre convert an image with for example http://dopiaza.org/tools/datauri
// http://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
function imgToBase64(url, callback) {
    if (!window.FileReader) {
        callback(null);
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result.replace('text/xml', 'image/jpeg'));
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.send();
}