export default class Icon {
    constructor(context, x, y, w, h, image_path) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.image = new Image();
        this.image.src = image_path;
        this.image.onload = () => {
            this.draw();
        };

        this.fixed_delta = 15;
    }

    contains(x, y) {
        return this.x + this.fixed_delta < x && x < this.x - this.fixed_delta + this.w && this.y + this.fixed_delta < y && y < this.y - this.fixed_delta + this.h;
    }

    draw() {
        this.context.drawImage(this.image, this.x, this.y, this.w, this.h);
    }

    draw_rect() {
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.w, this.h);
        this.context.stroke();
    }

    is_in_line_x(icon) {
        return Math.abs(this.x - icon.x) < 2;
    }

    is_in_line_y(icon) {
        return Math.abs(this.y - icon.y) < 2;
    }

    lineTo(icon) {
        this.context.setLineDash([8, 2]);
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(icon.x, icon.y);
        this.context.stroke();
        this.context.setLineDash([]);
    }
}