function wspShowInfo(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'info'
    });
}

function wspShowError(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'error'
    });

}

function wspShowSuccess(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'success'
    });
}


function wspShowSuccessBottomRight(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'info',
        push: 'top',
        addclass: "stack-bottomright",
    })
}
