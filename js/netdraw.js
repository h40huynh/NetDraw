import Icon from './icon.js';

export default class NetDraw {
    constructor() {
        this.icon_size = 80;
        this.icons = Array();
        this.selectedIcon = null;
        this.isDragging = false;
        this.isMoving = false;
        this.isPainting = false;
        this.startPos = null;
        this.endPos = null;

        this.drawline = Array();
        this.current_tool = this.get_current_tool();

        this.create_canvas();
        this.create_events()
    }

    create_canvas() {
        this.board = document.createElement('canvas');
        this.board.id = 'board';

        this.context = this.board.getContext('2d');

        this.board.height = screen.height - 100;
        this.board.width = screen.width - 50;

        document.getElementById('main-area').appendChild(this.board);
    }

    create_events() {
        this.map_id_button_with_event('add-server', './img/server_96px.png');
        this.map_id_button_with_event('add-ips', './img/cisco-ips.png');
        this.map_id_button_with_event('add-windows-client', './img/windows_client_96px.png');
        this.map_id_button_with_event('add-linux-server', './img/linux_server_96px.png');
        this.map_id_button_with_event('add-attacker', './img/hacking_96px.png');
        this.map_id_button_with_event('add-firewall', './img/firewall_96px.png');
        this.map_id_button_with_event('add-router', './img/router_96px.png');
        this.map_id_button_with_event('add-switch', './img/internet_hub_96px.png');
        this.map_id_button_with_event('add-wireless', './img/wi-fi_router_96px.png');

        this.board.addEventListener('mousedown', (e) => this.canvas_movedown(e));
        this.board.addEventListener('mouseup', (e) => this.canvas_moveup(e));
        this.board.addEventListener('mouseout', (e) => this.canvas_moveup(e));
        this.board.addEventListener('mousemove', (e) => this.canvas_movemove(e));

        document.getElementById('selected-tool').addEventListener('change', () => {
            this.current_tool = this.get_current_tool();
        });

        document.getElementById('clear').addEventListener('click', () => {
            this.icons = Array();
            this.drawline = Array();
            this.redraw_icons();
        });
    }

    get_current_tool() {
        return document.getElementById('selected-tool').value;
    }

    map_id_button_with_event(id, image_path) {
        document.getElementById(id).addEventListener('click', (e) => this.create_icon(image_path));
    }

    create_icon(image_path) {
        var x_random = Math.floor(Math.random() * 400);
        var y_random = Math.floor(Math.random() * 400);
        var icon = new Icon(this.context, x_random, y_random, this.icon_size, this.icon_size, image_path);
        this.icons.push(icon);
    }

    canvas_moveup(e) {
        var x_canvas = parseInt(e.clientX - this.board.offsetLeft);
        var y_canvas = parseInt(e.clientY - this.board.offsetTop);
        this.isDragging = false;
        this.isMoving = false;

        if (this.isPainting) {
            switch (this.current_tool) {
                case 'pencil':
                    this.drawline.push({
                        x: -1,
                        y: -1
                    });
                    break;
                case 'line':
                    this.drawline.push(this.startPos);
                    this.drawline.push({
                        x: x_canvas,
                        y: y_canvas
                    });
                    this.drawline.push({
                        x: -1,
                        y: -1
                    });
                    break;
                default:
                    break;
            }
            this.isPainting = false;
        }
    }

    canvas_movedown(e) {
        var x_canvas = parseInt(e.clientX - this.board.offsetLeft);
        var y_canvas = parseInt(e.clientY - this.board.offsetTop);
        this.detect_selected_icon(x_canvas, y_canvas)
        var x_canvas = parseInt(e.clientX - this.board.offsetLeft);
        var y_canvas = parseInt(e.clientY - this.board.offsetTop);

        if (this.selectedIcon) {
            if (this.selectedIcon.contains(x_canvas, y_canvas)) {
                this.isDragging = true;
                this.isMoving = true;
                this.delaX = x_canvas - this.selectedIcon.x;
                this.delaY = y_canvas - this.selectedIcon.y;
            }
        } else {
            this.isDragging = true;
            this.isPainting = true;

            switch (this.current_tool) {
                case 'pencil':
                    this.drawline.push({
                        x: x_canvas,
                        y: y_canvas
                    });
                    break;
                case 'line':
                    this.startPos = {
                        x: x_canvas,
                        y: y_canvas
                    };
                    break;
                default:
                    break;
            }
        }
    }

    canvas_movemove(e) {
        if (this.isDragging) {
            var x_canvas = parseInt(e.clientX - this.board.offsetLeft);
            var y_canvas = parseInt(e.clientY - this.board.offsetTop);

            if (this.isMoving) {
                this.selectedIcon.x = x_canvas - this.delaX;
                this.selectedIcon.y = y_canvas - this.delaY;
                this.redraw_icons();
                this.detect_in_line_icon();
            } else if (this.isPainting) {
                if (this.current_tool == 'pencil') {
                    this.drawline.push({
                        x: x_canvas,
                        y: y_canvas
                    });
                    this.redraw_icons();
                } else if (this.current_tool == 'line') {
                    var thisPoint = {
                        x: x_canvas,
                        y: y_canvas
                    };
                    this.redraw_icons();
                    this.point_to_point(this.startPos, thisPoint);
                }
            }
        }
    }

    detect_selected_icon(x_canvas, y_canvas) {
        this.selectedIcon = this.icons.find(icon => icon.contains(x_canvas, y_canvas));
        if (this.selectedIcon) {
            this.redraw_icons();
            this.selectedIcon.draw_rect();
        } else {
            this.selectedIcon = null;
            this.redraw_icons();
        }
    }

    detect_in_line_icon() {
        this.icons.forEach(icon => {
            if (icon != this.selectedIcon) {
                if (this.selectedIcon.is_in_line_x(icon) || this.selectedIcon.is_in_line_y(icon)) {
                    this.selectedIcon.lineTo(icon);
                }
            }
        });
    }

    point_to_point(startPoint, endPoint) {
        this.context.beginPath();
        this.context.moveTo(startPoint.x, startPoint.y);
        this.context.lineTo(endPoint.x, endPoint.y);
        this.context.stroke();
    }

    redraw_icons() {
        this.context.clearRect(0, 0, this.board.width, this.board.height);
        this.icons.forEach(icon => icon.draw());
        for (let i = 0; i < this.drawline.length - 1; i++) {
            if (this.drawline[i].x != -1 && this.drawline[i + 1].x != -1) {
                this.point_to_point(this.drawline[i], this.drawline[i + 1]);
            }
        }
    }
}