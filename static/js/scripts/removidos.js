function ajaxRequest(method, url, data) {
    return $.ajax({
        type: method,
        url: url,
        contentType: "application/json",
        data: JSON.stringify(data)
    });
}

function handleError(jqXHR) {
    const errorMessage = jqXHR.responseJSON?.message || `Error inesperado. Código: ${jqXHR.status}`;
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Aceptar'
    });
}

function showError(message) {
    $("#error-message").text(message).removeClass("d-none");
}

function getTabla() {
    $("#loader").show();
    $.ajax({
        type: "GET",
        url: "/api/removidos",
        dataType: "json",
    })
        .done((data) => {
            const t = $('#tablaRemovidos').DataTable();
            t.clear().draw(false);

            if(data.ok) {
                $.each(data.body, (index, registro) => {
                    const buttons = `
                        <button type="button" class="btn btn-success btn-sm restaurar" data-id="${registro.id}">
                          <i class="fas fa-reply"></i>
                        </button>`
                    t.row.add([
                        buttons,
                        registro.fecha,
                        registro.hora,
                        registro.valor1,
                        registro.valor2,
                        registro.valor3,
                        registro.valor4
                    ]);
                })
                t.draw(false);
            }
            else {
                console.error("Error en la respuesta: ", data.message);
            }
        })
        .fail(handleError)
        .always(() => {
            $("#loader").hide();
        });
}

$(document).on('click', '.restaurar', function () {
    Swal.fire({
        title: 'Eliminar registro',
        text: "¿Está seguro de querer restaurar este registro?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si'
    }).then((result) => {
        if (result.isConfirmed) {
            const id = $(this).data('id');
            const method = 'PATCH';
            const url = `/api/removidos/${id}`;

            $("#loader").show();

            ajaxRequest(method, url)
                .done((data) => {
                    if(data.ok) {
                        getTabla();
                        Swal.fire({
                            icon: 'success',
                            title: 'Registro restaurado con éxito',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                    else {
                        showError(data.message)
                    }
                })
                .fail(handleError)
                .always(() => {
                    $("#loader").hide();
                });
                }
    })
});

$(document).ready(function () {
    $("#tablaRemovidos").DataTable({
        language: {
            lengthMenu: "Mostrar _MENU_ registros",
            zeroRecords: "No se encontraron coincidencias",
            info: "Mostrando del _START_ al _END_ de _TOTAL_ registros",
            infoEmpty: "Sin resultados",
            search: "Buscar: ",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior",
            },
        },
        columnDefs: [
            { targets: 0, orderable: true, },
        ],
    });

    getTabla();

    $('#guardar').click(() => save());

    $('#liSistema').addClass("menu-open");
    $('#liRemovidos').addClass("active");
});