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

function clearForm() {
    $("#fecha").val("");
    $("#hora").val("");
    $("#valor1").val("");
    $("#valor2").val("");
    $("#valor3").val("");
    $("#valor4").val("");
    $("#error-message").addClass("d-none");
}

function getTabla() {
    $("#loader").show();
    $.ajax({
        type: "GET",
        url: "/api/registros",
        dataType: "json",
    })
        .done((data) => {
            const t = $('#tablaRegistros').DataTable();
            t.clear().draw(false);

            if(data.ok) {
                $.each(data.body, (index, registro) => {
                    const buttons = `
                        <button type="button" class="btn btn-warning btn-sm editar" data-id="${registro.id}">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm eliminar" data-id="${registro.id}">
                          <i class="fas fa-trash"></i>
                        </button>`;
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

function save() {
    const fecha = $("#fecha").val();
    const hora = $("#hora").val();
    const valor1 = $("#valor1").val();
    const valor2 = $("#valor2").val();
    const valor3 = $("#valor3").val();
    const valor4 = $("#valor4").val();
    const id = $("#registroId").val();

    if (!fecha || !hora) {
        $("#error-message").text("Por favor, complete los campos.").removeClass("d-none");
        return;
    } else {
        $("#error-message").addClass("d-none");
    }

    const registro = {
        fecha: fecha,
        hora: hora,
        valor1: valor1,
        valor2: valor2,
        valor3: valor3,
        valor4: valor4,
    };

    $("#loader").show();

    const method = id ? "PUT" : "POST";
    const url = id ? `/api/registros/${id}` : "/api/registros";

    ajaxRequest(method, url, registro)
        .done((data) => {
            if(data.ok) {
                getTabla();
                $("#modal-update").modal("hide");
                Swal.fire({
                    icon: 'success',
                    title: id
                        ? 'Registro actualizado con éxito'
                        : 'Registro guardado con éxito',
                    showConfirmButton: false,
                    timer: 1500
                });
                clearForm();
            }
            else {
                showError(data.message);
            }
        })
        .fail(handleError)
        .always(() => {
            $("#loader").hide();
        });
}

$(document).on('click', '.editar', function () {
    console.log('error')
    const id = $(this).data('id');
    const method = 'GET';
    const url = `/api/registros/${id}`;

    $("#loader").show();

    ajaxRequest(method, url)
        .done((data) => {
            $("#fecha").val(data.fecha);
            $("#hora").val(data.hora);
            $("#valor1").val(data.valor1);
            $("#valor2").val(data.valor2);
            $("#valor3").val(data.valor3);
            $("#valor4").val(data.valor4);
            $("#modal-title").text('Editar Registro')

            $("#modal-update").modal('show');
        })
        .fail(() => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener el registro.'
            })
        })
        .always(() => {
            $("#loader").hide();
        });
});

$(document).on('click', '.eliminar', function () {
    Swal.fire({
        title: 'Eliminar registro',
        text: "¿Está seguro de querer eliminar este registro?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si'
    }).then((result) => {
        if (result.isConfirmed) {
            const id = $(this).data('id');
            const method = 'PATCH';
            const url = `/api/registros/${id}`;

            $("#loader").show();

            ajaxRequest(method, url)
                .done((data) => {
                    if(data.ok) {
                        getTabla();
                        Swal.fire({
                            icon: 'success',
                            title: 'Registro eliminado con éxito',
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
    });
});

$(document).ready(function () {
    $("#tablaRegistros").DataTable({
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
    $('#liRegistros').addClass("active");
});